import { ROLES } from "@/const";
import { supabaseClient } from "@/lib/supabaseClient";
import type { Profile } from "@/contexts/AuthContext";
import type {
  CallRow,
  ClinicRow,
  Profile as SupabaseProfile,
  SubscriptionRow,
} from "@shared/supabase.types";
import { User } from "@supabase/supabase-js";

export async function loadProfile(userId: string): Promise<Profile | null> {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, role, agency_id, clinic_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Failed to load profile", error);
    throw error;
  }

  if (!data) return null;
  return {
    id: data.id,
    role: data.role,
    agencyId: data.agency_id,
    clinicId: data.clinic_id,
  };
}

export async function provisionIndependentClinic(params: {
  user: User;
  clinicName: string;
  phoneNumber?: string;
}): Promise<{ profile: SupabaseProfile | null; clinic: ClinicRow | null }> {
  if (!supabaseClient) throw new Error("Supabase not configured");

  const clinicId = crypto.randomUUID();
  const { data: clinic, error: clinicError } = await supabaseClient
    .from("clinics")
    .insert({
      id: clinicId,
      name: params.clinicName,
      phone_number: params.phoneNumber ?? null,
      agency_id: null,
      system_status: "active",
    })
    .select("*")
    .maybeSingle();

  if (clinicError) throw clinicError;

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .insert({ id: params.user.id, role: ROLES.independentClinic, clinic_id: clinicId })
    .select("*")
    .maybeSingle();

  if (profileError) throw profileError;

  return { profile, clinic };
}

export async function provisionManagedClinicUser(params: {
  agencyId: string;
  clinicName: string;
  ghlLocationId?: string;
  phoneNumber?: string;
  username: string;
  password: string;
  accessToken?: string | null;
}): Promise<{ clinic: ClinicRow | null; profile: SupabaseProfile | null }> {
  if (!supabaseClient) throw new Error("Supabase not configured");

  const clinicId = crypto.randomUUID();
  const { data: clinic, error: clinicError } = await supabaseClient
    .from("clinics")
    .insert({
      id: clinicId,
      name: params.clinicName,
      ghl_location_id: params.ghlLocationId ?? null,
      phone_number: params.phoneNumber ?? null,
      agency_id: params.agencyId,
      system_status: "active",
    })
    .select("*")
    .maybeSingle();

  if (clinicError) throw clinicError;

  // This endpoint uses the service role to create a Supabase auth user + profile.
  const response = await fetch("/api/provision/managed-clinic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(params.accessToken ? { Authorization: `Bearer ${params.accessToken}` } : {}),
    },
    body: JSON.stringify({
      clinicId,
      username: params.username,
      password: params.password,
      agencyId: params.agencyId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to provision managed clinic user");
  }

  const { profile } = (await response.json()) as { profile: SupabaseProfile | null };
  return { clinic, profile };
}

export async function fetchAgencyClinics(agencyId: string): Promise<ClinicRow[]> {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from("clinics")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchClinicCalls(clinicId: string): Promise<CallRow[]> {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from("calls")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("timestamp", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSubscription(
  ownerType: SubscriptionRow["owner_type"],
  ownerId: string
): Promise<SubscriptionRow | null> {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("subscriptions")
    .select("*")
    .eq("owner_type", ownerType)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
