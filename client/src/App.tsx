import NotFound from "@/pages/NotFound";
import AgencyBilling from "@/pages/agency/AgencyBilling";
import AgencyDashboard from "@/pages/agency/AgencyDashboard";
import AgencySettings from "@/pages/agency/AgencySettings";
import ClinicBilling from "@/pages/clinic/ClinicBilling";
import ClinicDashboard from "@/pages/clinic/ClinicDashboard";
import Landing from "@/pages/Landing";
import AgencyLogin from "@/pages/auth/AgencyLogin";
import ClinicLogin from "@/pages/auth/ClinicLogin";
import ClinicSignup from "@/pages/auth/ClinicSignup";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ROLES, type UserRole } from "./const";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function RequireRole({
  allowedRoles,
  redirect,
  children,
}: {
  allowedRoles: UserRole[];
  redirect: string;
  children: JSX.Element;
}) {
  const { profile, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!profile || !allowedRoles.includes(profile.role)) {
      setLocation(redirect);
    }
  }, [allowedRoles, loading, profile, redirect, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Checking access...
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) return null;

  return children;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth/agency-login" component={AgencyLogin} />
      <Route path="/auth/clinic-login" component={ClinicLogin} />
      <Route path="/auth/clinic-signup" component={ClinicSignup} />

      <Route path="/agency">
        {() => (
          <RequireRole allowedRoles={[ROLES.agencyAdmin]} redirect="/auth/agency-login">
            <AgencyDashboard />
          </RequireRole>
        )}
      </Route>
      <Route path="/agency/billing">
        {() => (
          <RequireRole allowedRoles={[ROLES.agencyAdmin]} redirect="/auth/agency-login">
            <AgencyBilling />
          </RequireRole>
        )}
      </Route>
      <Route path="/agency/settings">
        {() => (
          <RequireRole allowedRoles={[ROLES.agencyAdmin]} redirect="/auth/agency-login">
            <AgencySettings />
          </RequireRole>
        )}
      </Route>

      <Route path="/clinic/billing">
        {() => (
          <RequireRole
            allowedRoles={[ROLES.independentClinic]}
            redirect="/clinic"
          >
            <ClinicBilling />
          </RequireRole>
        )}
      </Route>
      <Route path="/clinic">
        {() => (
          <RequireRole allowedRoles={[ROLES.independentClinic, ROLES.managedClinic]} redirect="/auth/clinic-login">
            <ClinicDashboard />
          </RequireRole>
        )}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AgencyProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </AgencyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
