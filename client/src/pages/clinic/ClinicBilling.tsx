import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PADDLE_BILLING_LINK, ROLES } from "@/const";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, PauseCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ClinicBilling() {
  const { profile } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"active" | "canceled">("active");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (profile?.role === ROLES.managedClinic) {
      setLocation("/clinic");
    }
  }, [profile, setLocation]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Independent Clinic Billing</p>
            <h1 className="text-2xl font-semibold">Usage only – no setup fee</h1>
          </div>
          <Button variant="ghost" onClick={() => setLocation("/clinic")}>Back to dashboard</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {status === "canceled" && (
          <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-100">
            <PauseCircle className="h-4 w-4" />
            <AlertTitle>Plan canceled</AlertTitle>
            <AlertDescription>
              Your plan is marked as canceled. Resume billing to re-activate AI answering.
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader>
            <CardTitle>Usage-only plan</CardTitle>
            <CardDescription>Pay only for minutes your AI receptionist handles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>No setup fee. Billing is handled via Paddle.</p>
            <p>Managed clinics cannot access this page; agencies cover their license.</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Button asChild>
              <a href={PADDLE_BILLING_LINK} target="_blank" rel="noreferrer">
                <CreditCard className="h-4 w-4 mr-2" /> Update payment method
              </a>
            </Button>
            <Button variant="outline" onClick={() => setConfirming(true)}>
              Stop subscription
            </Button>
          </CardFooter>
        </Card>
      </main>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel plan?</DialogTitle>
            <DialogDescription>
              Confirm to mark your usage plan as canceled. You can resume anytime by visiting the Paddle portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Keep plan
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setStatus("canceled");
                setConfirming(false);
              }}
            >
              Cancel plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
