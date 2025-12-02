import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PADDLE_BILLING_LINK } from "@/const";
import { StopCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSubscription } from "@/services/supabaseProfiles";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AgencyBilling() {
  const { profile, session } = useAuth();
  const [, setLocation] = useLocation();
  const [subscriptionStatus, setSubscriptionStatus] = useState<"active" | "canceled" | "trialing" | "past_due">("trialing");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.agencyId) return;
    setLoading(true);
    fetchSubscription("agency", profile.agencyId)
      .then(subscription => {
        if (subscription?.status) {
          setSubscriptionStatus(subscription.status);
        }
      })
      .catch(err => {
        console.error("[AgencyBilling] Failed to load subscription", err);
        toast.error("Unable to load billing status");
      })
      .finally(() => setLoading(false));
  }, [profile?.agencyId]);

  const cancelSubscription = async () => {
    if (!profile?.agencyId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ ownerType: "agency", ownerId: profile.agencyId }),
      });
      if (!res.ok) throw new Error("Failed to cancel subscription");
      setSubscriptionStatus("canceled");
      toast.success("Subscription marked as canceled. Paddle will finalize.");
    } catch (err) {
      console.error("[AgencyBilling] Cancel error", err);
      toast.error("Unable to cancel subscription");
    } finally {
      setConfirming(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Agency Billing</p>
            <h1 className="text-2xl font-semibold">License & monthly plans</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/agency")}>Dashboard</Button>
            <Button variant="ghost" onClick={() => setLocation("/agency/settings")}>Settings</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {subscriptionStatus === "canceled" && (
          <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-100">
            <StopCircle className="h-4 w-4" />
            <AlertTitle>Subscription paused</AlertTitle>
            <AlertDescription>
              Your agency license is marked as canceled. Resume billing to re-activate live answering for clinics.
            </AlertDescription>
          </Alert>
        )}
        {!isSupabaseConfigured && (
          <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-100">
            <AlertTitle>Supabase not configured</AlertTitle>
            <AlertDescription>Billing status requires Supabase + Paddle webhook data.</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle>License Fee</CardTitle>
              <CardDescription>Base license for agencies managing multiple clinics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Includes dashboard access, provisioning managed clinics, and impersonation.</p>
              <p>Usage-based call fees billed separately per clinic.</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button asChild>
                <a href={PADDLE_BILLING_LINK} target="_blank" rel="noreferrer">
                  {subscriptionStatus === "active" ? "Manage subscription" : "Pay with Paddle"}
                </a>
              </Button>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-100">
                {loading ? "Loading" : subscriptionStatus}
              </Badge>
            </CardFooter>
          </Card>

          <Card className="bg-slate-900/60 border-white/10">
            <CardHeader>
              <CardTitle>Monthly</CardTitle>
              <CardDescription>Plan explanation and renewal reminders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Connect Paddle to handle recurring invoices.</p>
              <p>Managed clinics never see billing inside their portal.</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setConfirming(true)} disabled={loading}>
                Stop Subscription
              </Button>
              <Badge variant="secondary" className="bg-white/10 text-white">
                {loading ? "Loading" : subscriptionStatus}
              </Badge>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop subscription?</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop your subscription? Your clinics will see a paused status.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Never mind
            </Button>
            <Button variant="destructive" onClick={cancelSubscription} disabled={loading}>
              Stop subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
