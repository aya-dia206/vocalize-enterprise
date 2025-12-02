import { APP_TITLE, ROLES, type UserRole } from "@/const";
import { supabaseClient } from "@/lib/supabaseClient";
import { AuthError, Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";

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
  const [profile, setProfile] = useState<Profile | null>(() => {
    const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
    return stored ? (JSON.parse(stored) as Profile) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (savedProfile && !profile) {
      setProfile(JSON.parse(savedProfile) as Profile);
    }
  }, [profile]);

  useEffect(() => {
    if (!supabaseClient) return;

    const setup = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      const derivedProfile = deriveProfileFromUser(data.session?.user ?? null);
      if (derivedProfile) {
        setProfile(derivedProfile);
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(derivedProfile));
      }
    };

    setup();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        const derivedProfile = deriveProfileFromUser(newSession?.user ?? null);
        setProfile(derivedProfile);
        if (derivedProfile) {
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(derivedProfile));
        } else {
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
    if (supabaseClient) {
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
      const derivedProfile = deriveProfileFromUser(data.user ?? null, roleHint);
      saveProfile(derivedProfile);
      return;
    }

    const fallbackProfile: Profile = {
      id: nanoid(),
      email,
      role: roleHint ?? ROLES.independentClinic,
      clinicId: roleHint ? "" : nanoid(),
    };
    saveProfile(fallbackProfile);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    if (supabaseClient) {
      const { error: authError } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: { prompt: "consent" },
          redirectTo: window.location.origin,
        },
      });
      setLoading(false);
      if (authError) setError(authError);
      return;
    }
    saveProfile({ id: nanoid(), role: ROLES.agencyAdmin, agencyId: nanoid() });
    setLoading(false);
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
    if (supabaseClient) {
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
      setLoading(false);
      if (authError) {
        setError(authError);
        return;
      }
      const derivedProfile = deriveProfileFromUser(data.user ?? null, ROLES.independentClinic);
      saveProfile(
        derivedProfile ?? {
          id: data.user?.id ?? nanoid(),
          email,
          role: ROLES.independentClinic,
          clinicId: nanoid(),
        }
      );
      return;
    }

    const localProfile: Profile = {
      id: nanoid(),
      email,
      role: ROLES.independentClinic,
      clinicId: nanoid(),
      metadata: { clinicName: name },
    };
    saveProfile(localProfile);
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

function deriveProfileFromUser(user: User | null, roleHint?: UserRole): Profile | null {
  if (!user) return null;
  const role = (user.user_metadata?.role as UserRole | undefined) ?? roleHint;
  const agencyId = user.user_metadata?.agency_id as string | null | undefined;
  const clinicId = user.user_metadata?.clinic_id as string | null | undefined;
  if (!role) return null;

  return {
    id: user.id,
    email: user.email,
    role,
    agencyId: agencyId ?? null,
    clinicId: clinicId ?? null,
    metadata: user.user_metadata,
  };
}

export function useRoleGuard() {
  const { profile } = useAuth();
  return profile?.role ?? null;
}
