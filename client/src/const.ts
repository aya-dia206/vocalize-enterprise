export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Hybrid AI Receptionist";
export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO || "https://placehold.co/128x128/0F172A/F8FAFC?text=AI";

export const ROLES = {
  agencyAdmin: "agency_admin",
  managedClinic: "managed_clinic",
  independentClinic: "independent_clinic",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const PADDLE_BILLING_LINK =
  import.meta.env.VITE_PADDLE_BILLING_LINK ||
  "https://example.paddle.com/checkout/usage-only";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
