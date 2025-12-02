import { APP_TITLE, ROLES, type UserRole } from "@/const";
import { supabaseClient } from "@/lib/supabaseClient";
import { loadProfile, provisionIndependentClinic } from "@/services/supabaseProfiles";
import { AuthError, Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Profile = {
  id: string;
  email?: string | null;
  role: UserRole;
  agencyId?: string | null;
  clinicId?: string | null;
  metadata?: Record<string, unknown>;
};

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: AuthError | null;
  signInWithEmail: (email: string, password: string, roleHint?: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInManagedClinic: (username: string, password: string) => Promise<void>;
  signUpIndependentClinic: (params: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setProfileOverride: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_PROFILE_KEY = "vocalize_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    if (!supabaseClient) return;

    const setup = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        const loaded = await loadProfile(data.session.user.id);
        if (loaded) {
          setProfile(loaded);
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(loaded));
        }
      }
    };

    setup();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          loadProfile(newSession.user.id)
            .then(derivedProfile => {
              setProfile(derivedProfile);
              if (derivedProfile) {
                localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(derivedProfile));
              }
            })
            .catch(err => {
              console.error("[Auth] Failed to load profile", err);
              setError(err);
              setProfile(null);
            });
        } else {
          setProfile(null);
          localStorage.removeItem(LOCAL_PROFILE_KEY);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const saveProfile = (next: Profile | null) => {
    setProfile(next);
    if (next) {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(LOCAL_PROFILE_KEY);
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string,
    roleHint?: UserRole
  ) => {
    setLoading(true);
    setError(null);
    if (!supabaseClient) {
      setLoading(false);
      throw new Error("Supabase is not configured; cannot sign in.");
    }

    const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    setSession(data.session ?? null);
    setUser(data.user ?? null);
    if (data.user) {
      const derivedProfile = await loadProfile(data.user.id);
      if (derivedProfile) {
        saveProfile(derivedProfile);
      }
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    if (!supabaseClient) {
      setLoading(false);
      throw new Error("Supabase is not configured; cannot sign in.");
    }
    const { error: authError } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { prompt: "consent" },
        redirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (authError) setError(authError);
  };

  const signInManagedClinic = async (username: string, password: string) => {
    await signInWithEmail(username, password, ROLES.managedClinic);
  };

  const signUpIndependentClinic = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);
    if (!supabaseClient) {
      setLoading(false);
      throw new Error("Supabase is not configured; cannot sign up.");
    }

    const { data, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: ROLES.independentClinic,
          clinic_name: name,
          app: APP_TITLE,
        },
      },
    });
    if (authError) {
      setLoading(false);
      setError(authError);
      return;
    }

    if (data.user) {
      await provisionIndependentClinic({ user: data.user, clinicName: name });
      const derivedProfile = await loadProfile(data.user.id);
      saveProfile(
        derivedProfile ?? {
          id: data.user.id,
          email,
          role: ROLES.independentClinic,
          clinicId: null,
          agencyId: null,
        }
      );
    }
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    if (supabaseClient) {
      const { error: authError } = await supabaseClient.auth.signOut();
      if (authError) setError(authError);
    }
    saveProfile(null);
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      error,
      signInWithEmail,
      signInWithGoogle,
      signInManagedClinic,
      signUpIndependentClinic,
      signOut,
      setProfileOverride: saveProfile,
    }),
    [user, session, profile, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export function useRoleGuard() {
  const { profile } = useAuth();
  return profile?.role ?? null;
}
