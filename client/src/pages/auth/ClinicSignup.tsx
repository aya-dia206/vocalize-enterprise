import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { ROLES } from "@/const";
import { CreditCard, Loader2, Wand2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ClinicSignup() {
  const { signUpIndependentClinic, profile, error, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.role === ROLES.independentClinic) {
      setLocation("/clinic/billing");
    }
    if (profile?.role === ROLES.managedClinic) setLocation("/clinic");
    if (profile?.role === ROLES.agencyAdmin) setLocation("/agency");
  }, [profile, setLocation]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await signUpIndependentClinic({ name, email, password });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 py-10">
      <Card className="w-full max-w-xl bg-slate-900/60 border-white/10">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-emerald-200 uppercase tracking-[0.2em]">
            <Wand2 className="h-4 w-4" />
            Independent Clinic Signup
          </div>
          <CardTitle className="text-2xl">Create your clinic account</CardTitle>
          <CardDescription className="text-slate-300">
            Usage Only – No Setup Fee. We will redirect you straight to billing to activate your AI receptionist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Unable to sign up</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Clinic Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Bright Smile Dental"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="owner@brightsmile.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || loading}>
              {submitting || loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating clinic...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" /> Continue to Billing
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
