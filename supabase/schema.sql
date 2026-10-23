-- El-Roi Gospel Talent Hunt — initial schema draft.
-- Review and apply in a dedicated Supabase project before enabling live submissions.
create extension if not exists pgcrypto;

create type public.registration_entry_type as enum ('individual','group');
create type public.payment_review_status as enum ('pending_payment','payment_under_review','confirmed','rejected');

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  registration_reference text not null unique,
  entry_type public.registration_entry_type not null,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null,
  phone text not null,
  category text not null,
  notes text,
  fee_amount integer not null check (fee_amount in (3000,10000)),
  payment_status public.payment_review_status not null default 'pending_payment',
  created_at timestamptz not null default now()
);

create table public.contestants (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid unique references public.registrations(id) on delete restrict,
  user_id uuid unique references auth.users(id) on delete set null,
  contestant_number text unique,
  stage_name text not null,
  category text not null,
  biography text not null default '',
  photo_path text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.voter_verifications (
  id uuid primary key default gen_random_uuid(),
  voter_user_id uuid not null references auth.users(id) on delete cascade,
  verified_at timestamptz not null default now(),
  unique(voter_user_id)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  contestant_id uuid not null references public.contestants(id) on delete restrict,
  voter_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(voter_user_id)
);

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;
alter table public.contestants enable row level security;
alter table public.voter_verifications enable row level security;
alter table public.votes enable row level security;
alter table public.admin_audit_log enable row level security;

-- Deliberately no public insert/select policies on registrations, votes, verification,
-- or audit records. Add narrowly scoped policies only after trusted server-side flows
-- and role handling are implemented. Public contestants should be exposed through a
-- safe published-only view/RPC, not unrestricted access to contestant rows.
