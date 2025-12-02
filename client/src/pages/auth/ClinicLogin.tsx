import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { ROLES } from "@/const";
import { LockKeyhole, TriangleAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ClinicLogin() {
  const { signInManagedClinic, profile, error, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (profile.role === ROLES.managedClinic || profile.role === ROLES.independentClinic) {
      setLocation("/clinic");
    }
    if (profile.role === ROLES.agencyAdmin) {
      setMessage("Agency admins should use the agency portal. Redirecting now.");
      setLocation("/agency");
    }
  }, [profile, setLocation]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await signInManagedClinic(username, password);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 py-10">
      <Card className="w-full max-w-lg bg-slate-900/60 border-white/10">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-emerald-200 uppercase tracking-[0.2em]">
            <LockKeyhole className="h-4 w-4" />
            Managed Clinic Login
          </div>
          <CardTitle className="text-2xl">Access your clinic dashboard</CardTitle>
          <CardDescription className="text-slate-300">
            Use the username and password provided by your agency. No self-signup or billing steps appear here.
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="clinic-user"
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
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
