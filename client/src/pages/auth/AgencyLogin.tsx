import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { APP_TITLE, ROLES } from "@/const";
import { Separator } from "@/components/ui/separator";
import { Github, LogIn, ShieldCheck, TriangleAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function AgencyLogin() {
  const { signInWithEmail, signInWithGoogle, profile, error, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (profile.role === ROLES.agencyAdmin) {
      setLocation("/agency");
    } else if (profile.role === ROLES.independentClinic || profile.role === ROLES.managedClinic) {
      setMessage("You are logged in as a clinic user. Redirecting to the clinic dashboard.");
      setLocation("/clinic");
    }
  }, [profile, setLocation]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await signInWithEmail(email, password, ROLES.agencyAdmin);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 py-10">
      <Card className="w-full max-w-lg bg-slate-900/60 border-white/10">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-200">Agency Admin</span>
          </div>
          <CardTitle className="text-2xl">Sign in to manage clinics</CardTitle>
          <CardDescription className="text-slate-300">
            {APP_TITLE} supports agencies managing multiple clinics. Use Google or email to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-100">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Wrong portal</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@agency.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || loading}>
              <LogIn className="h-4 w-4 mr-2" />
              {submitting ? "Signing in..." : "Sign in as Agency"}
            </Button>
          </form>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">or</span>
              <Separator className="flex-1" />
            </div>
            <Button variant="outline" className="w-full" onClick={signInWithGoogle} disabled={loading}>
              <Github className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
