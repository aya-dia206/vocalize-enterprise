import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export function getAdminSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE for admin operations");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getAnonSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY for anon operations");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
