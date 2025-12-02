import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getAdminSupabase, getAnonSupabase } from "./supabaseAdmin";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.post("/api/provision/managed-clinic", async (req, res) => {
    try {
      const { clinicId, username, password, agencyId } = req.body as {
        clinicId?: string;
        username?: string;
        password?: string;
        agencyId?: string;
      };
      if (!clinicId || !username || !password || !agencyId) {
        return res.status(400).json({ error: "Missing clinicId, username, password, or agencyId" });
      }

      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;
      const anon = getAnonSupabase();
      const admin = getAdminSupabase();

      if (!token) {
        return res.status(401).json({ error: "Missing bearer token" });
      }

      const { data: userData, error: userError } = await anon.auth.getUser(token);
      if (userError || !userData?.user) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const { data: profileRow, error: profileError } = await admin
        .from("profiles")
        .select("role, agency_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (profileError || !profileRow || profileRow.role !== "agency_admin" || profileRow.agency_id !== agencyId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { data: clinicRow, error: clinicError } = await admin
        .from("clinics")
        .select("id, agency_id")
        .eq("id", clinicId)
        .maybeSingle();
      if (clinicError || !clinicRow || clinicRow.agency_id !== agencyId) {
        return res.status(403).json({ error: "Clinic does not belong to agency" });
      }

      const email = username.includes("@") ? username : `${username}@managed.local`;
      const userResult = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "managed_clinic" },
        app_metadata: { role: "managed_clinic" },
      });

      if (userResult.error || !userResult.data.user) {
        throw userResult.error ?? new Error("Unknown error creating user");
      }

      const newUser = userResult.data.user;
      const { data: profile } = await admin
        .from("profiles")
        .insert({ id: newUser.id, role: "managed_clinic", clinic_id: clinicId, agency_id: agencyId })
        .select("*")
        .maybeSingle();

      return res.status(201).json({ profile, credentials: { email, password } });
    } catch (err) {
      console.error("[Provision] managed clinic failed", err);
      return res.status(500).json({ error: "Provisioning failed", details: `${err}` });
    }
  });

  app.post("/api/subscriptions/cancel", async (req, res) => {
    try {
      const { ownerType, ownerId } = req.body as { ownerType: "agency" | "clinic"; ownerId: string };
      if (!ownerType || !ownerId) return res.status(400).json({ error: "Missing owner" });
      const anon = getAnonSupabase();
      const admin = getAdminSupabase();
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Missing bearer token" });
      const { data: userData, error: userError } = await anon.auth.getUser(token);
      if (userError || !userData?.user) return res.status(401).json({ error: "Invalid token" });

      const { data: profileRow, error: profileError } = await admin
        .from("profiles")
        .select("role, agency_id, clinic_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (profileError || !profileRow) return res.status(403).json({ error: "Profile not found" });

      if (ownerType === "agency" && profileRow.role !== "agency_admin") {
        return res.status(403).json({ error: "Only agencies may cancel their subscription" });
      }
      if (ownerType === "clinic" && profileRow.role !== "independent_clinic") {
        return res.status(403).json({ error: "Only independent clinics may cancel their plan" });
      }
      if ((ownerType === "agency" && profileRow.agency_id !== ownerId) || (ownerType === "clinic" && profileRow.clinic_id !== ownerId)) {
        return res.status(403).json({ error: "Owner mismatch" });
      }

      await admin
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("owner_type", ownerType)
        .eq("owner_id", ownerId);

      // TODO: call Paddle API to initiate cancellation when credentials are wired.
      return res.status(200).json({ status: "canceled" });
    } catch (err) {
      console.error("[Subscriptions] cancel failed", err);
      return res.status(500).json({ error: "Failed to cancel" });
    }
  });

  app.post("/api/webhooks/paddle", async (req, res) => {
    // TODO: add Paddle signature validation. Payload shape differs between classic/new APIs.
    try {
      const admin = getAdminSupabase();
      const event = req.body as any;
      const metadata = event?.data?.metadata ?? event?.metadata ?? {};
      const ownerType = metadata.owner_type as "agency" | "clinic" | undefined;
      const ownerId = metadata.owner_id as string | undefined;
      if (!ownerType || !ownerId) {
        console.warn("[Paddle] Missing owner metadata", event);
        return res.status(202).json({});
      }

      const status = event?.data?.status ?? event?.event_type ?? "active";
      const plan = event?.data?.plan ?? event?.data?.items?.[0]?.price?.name ?? "usage_only";
      const currentPeriodEnd = event?.data?.next_billed_at ?? null;
      const paddleSubscriptionId = event?.data?.id ?? event?.data?.subscription_id ?? null;
      await admin
        .from("subscriptions")
        .upsert({
          owner_type: ownerType,
          owner_id: ownerId,
          status,
          plan,
          paddle_subscription_id: paddleSubscriptionId,
          current_period_end: currentPeriodEnd,
        });

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("[Paddle webhook] failed", err);
      return res.status(500).json({ error: "Webhook error" });
    }
  });
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
