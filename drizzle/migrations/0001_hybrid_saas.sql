-- Hybrid AI Receptionist core schema for Supabase parity
create table if not exists agencies (
  id uuid primary key,
  name text not null,
  owner_user_id uuid not null,
  logo_url text,
  brand_color text,
  system_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinics (
  id uuid primary key,
  name text not null,
  ghl_location_id text,
  phone_number text,
  agency_id uuid references agencies(id),
  system_status text not null default 'active',
  forwarding_number text,
  voice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id),
  role text not null,
  agency_id uuid references agencies(id),
  clinic_id uuid references clinics(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists calls (
  id uuid primary key,
  clinic_id uuid references clinics(id) not null,
  caller text not null,
  timestamp timestamptz not null default now(),
  duration_seconds integer,
  status text not null,
  summary text,
  transcript text,
  recording_url text,
  sentiment_score numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key,
  owner_type text not null,
  owner_id uuid not null,
  paddle_subscription_id text,
  status text not null default 'trialing',
  plan text,
  billing_email text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS policy stubs (to be applied in Supabase)
-- agencies: enable row level security; allow update/select where id = auth.uid()->profiles.agency_id for role agency_admin
-- clinics: enable RLS; agency_admin can access clinics.agency_id = profile.agency_id;
--          managed/independent clinic can access only clinic_id = profile.clinic_id
-- calls: enable RLS; clinics match profile.clinic_id, agencies join clinics on agency_id
-- subscriptions: enable RLS; owner_type/owner_id must match profile agency/clinic, deny managed clinics
