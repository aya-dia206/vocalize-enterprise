export type Role = "agency_admin" | "managed_clinic" | "independent_clinic";

export interface Profile {
  id: string;
  role: Role;
  agency_id: string | null;
  clinic_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AgencyRow {
  id: string;
  name: string;
  owner_user_id: string;
  logo_url: string | null;
  brand_color: string | null;
  system_status: "active" | "paused";
  created_at?: string;
  updated_at?: string;
}

export interface ClinicRow {
  id: string;
  name: string;
  ghl_location_id: string | null;
  phone_number: string | null;
  agency_id: string | null;
  system_status: "active" | "paused";
  forwarding_number: string | null;
  voice: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CallRow {
  id: string;
  clinic_id: string;
  caller: string;
  timestamp: string;
  duration_seconds: number | null;
  status: "answered" | "missed" | "voicemail" | "routed";
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  sentiment_score: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionRow {
  id: string;
  owner_type: "agency" | "clinic";
  owner_id: string;
  paddle_subscription_id: string | null;
  status: "active" | "canceled" | "trialing" | "past_due";
  plan: string | null;
  billing_email: string | null;
  current_period_end: string | null;
  created_at?: string;
  updated_at?: string;
}
