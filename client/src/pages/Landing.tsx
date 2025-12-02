import { APP_LOGO, APP_TITLE } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Shield, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Landing() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12 rounded-xl shadow-lg ring-1 ring-white/10" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">24/7 AI Voice Receptionist</p>
              <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-200 border-emerald-500/40">
              Multi-tenant ready
            </Badge>
            <Button variant="outline" onClick={() => setLocation("/auth/agency-login")}>
              Agency Login
            </Button>
          </div>
        </header>

        <main className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10 text-sm text-white/70">
              <Sparkles className="h-4 w-4 text-amber-300" /> Hybrid model: Agencies + Clinics
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-semibold leading-tight">
                Automate every inbound call with a human-grade AI receptionist.
              </h2>
              <p className="text-lg text-white/70 max-w-2xl">
                Agencies manage fleets of clinics. Clinics can come with credentials or sign up independently and pay as
                they go. All flows lead to the right dashboard with clear billing rules.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="shadow-lg shadow-emerald-500/20" onClick={() => setLocation("/auth/agency-login")}>
                For Agencies
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
                    For Clinics
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Choose your clinic path</DialogTitle>
                    <DialogDescription>
                      Managed clinics sign in with credentials from their agency. Independent clinics create their own
                      account and pay for usage-only minutes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                      <CardHeader>
                        <CardTitle>Managed by an Agency</CardTitle>
                        <CardDescription>Use the username and password provided by your agency.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full" onClick={() => setLocation("/auth/clinic-login")}>I have credentials</Button>
                        <p className="text-xs text-muted-foreground">No billing steps. Access is provisioned by your agency.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Independent Clinic</CardTitle>
                        <CardDescription>Self-serve signup with usage-only pricing via Paddle.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full" onClick={() => setLocation("/auth/clinic-signup")}>Create my account</Button>
                        <p className="text-xs text-muted-foreground">Includes automatic redirect to billing after signup.</p>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/80">
              {["Agency + direct onboarding", "Usage-only billing for independent clinics", "Managed clinics never see billing", "Supabase auth roles: agency_admin / managed_clinic / independent_clinic"].map(feature => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-emerald-500/20 p-1 text-emerald-300">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>How it works</CardTitle>
                <CardDescription>Clear entry points for every role.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StepRow title="Agencies manage many clinics" body="Provision credentials, monitor call performance, and control system status from one dashboard." />
                <Separator className="bg-white/10" />
                <StepRow title="Managed clinics" body="Log in with provided credentials. No billing access. Dashboard shows status, logs, and analytics." />
                <Separator className="bg-white/10" />
                <StepRow title="Independent clinics" body="Self-sign-up, go straight to billing to activate Paddle usage-only plan, then manage calls." />
              </CardContent>
            </Card>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Shield className="h-4 w-4 text-emerald-300" />
              Role-based route guards keep everyone in the right place.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StepRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <p className="font-semibold text-white">{title}</p>
      <p className="text-sm text-white/70 leading-relaxed">{body}</p>
    </div>
  );
}
