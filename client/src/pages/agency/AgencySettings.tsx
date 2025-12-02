import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldOff, ShieldCheck } from "lucide-react";

export default function AgencySettings() {
  const [, setLocation] = useLocation();
  const [logoUrl, setLogoUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#22c55e");
  const [systemActive, setSystemActive] = useState(true);
  const [confirmingStop, setConfirmingStop] = useState(false);

  const handleStop = () => {
    setSystemActive(false);
    setConfirmingStop(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Agency Settings</p>
            <h1 className="text-2xl font-semibold">Branding & safety controls</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/agency")}>Dashboard</Button>
            <Button variant="ghost" onClick={() => setLocation("/agency/billing")}>Billing</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Update your agency look-and-feel. Clinics inherit branding for login screens.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Brand color</Label>
              <Input id="color" type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10">
          <CardHeader>
            <CardTitle>System stop / resume</CardTitle>
            <CardDescription>Pause live answering for all managed clinics. Requires confirmation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={systemActive ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-50" : "bg-amber-500/10 border-amber-500/40 text-amber-50"}>
              {systemActive ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
              <AlertTitle>{systemActive ? "System active" : "System paused"}</AlertTitle>
              <AlertDescription>
                {systemActive
                  ? "Calls are flowing to AI receptionists."
                  : "Paused — clinics will see an inactive banner until resumed."}
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-between border rounded-lg border-white/10 p-4 bg-white/5">
              <div>
                <p className="font-medium">Global status</p>
                <p className="text-sm text-muted-foreground">Toggle killswitch for all linked clinics.</p>
              </div>
              <Switch checked={systemActive} onCheckedChange={value => (value ? setSystemActive(true) : setConfirmingStop(true))} />
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={confirmingStop} onOpenChange={setConfirmingStop}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop all systems?</DialogTitle>
            <DialogDescription>
              Confirm with your password before pausing every managed clinic. (Backend policy enforcement expected.)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingStop(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleStop}>
              Confirm stop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
