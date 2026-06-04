-- ============================================================
-- MUSIC CLUB DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- CLUB MEMBERS TABLE
-- For the public "Our Members" page
-- ============================================================
CREATE TABLE club_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  roll_number   TEXT UNIQUE,
  year          INTEGER CHECK (year BETWEEN 1 AND 5),   -- year of study
  branch        TEXT,
  domain        TEXT NOT NULL,   -- 'musician' | 'management' | 'anchoring' | 'other'
  role          TEXT,            -- e.g. "Lead Guitarist", "Vocalist", "Event Head"
  instagram     TEXT,            -- instagram handle or full URL
  photo_url     TEXT,            -- Cloudinary URL
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for the members page (ordered by year)
CREATE INDEX idx_members_year ON club_members(year);
CREATE INDEX idx_members_domain ON club_members(domain);


-- ============================================================
-- AUDITION REGISTRATIONS TABLE
-- Stores both vocalist and instrumentalist registrations
-- ============================================================
CREATE TABLE audition_registrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Common fields
  full_name       TEXT NOT NULL,
  roll_number     TEXT NOT NULL,
  branch          TEXT NOT NULL,
  year            TEXT NOT NULL,               -- "1st", "2nd", etc.
  phone_number    TEXT NOT NULL,
  remarks         TEXT,
  registration_type TEXT NOT NULL CHECK (registration_type IN ('vocalist', 'instrumentalist')),

  -- Vocalist-specific
  languages       TEXT,                        -- comma-separated or free text
  backing_track_links TEXT,                    -- URLs pasted by user

  -- Instrumentalist-specific
  instruments     TEXT[],                      -- e.g. ['Guitar', 'Flute']
  needs_instrument BOOLEAN DEFAULT FALSE,      -- "Requirement for instrument from our side"

  -- Metadata
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  synced_to_sheet BOOLEAN DEFAULT FALSE        -- track Google Sheets sync status
);

-- Indexes for admin dashboard filtering
CREATE INDEX idx_reg_type ON audition_registrations(registration_type);
CREATE INDEX idx_reg_submitted ON audition_registrations(submitted_at DESC);
CREATE INDEX idx_reg_synced ON audition_registrations(synced_to_sheet);


-- ============================================================
-- ADMIN USERS
-- Supabase Auth handles passwords; this table stores metadata
-- ============================================================
CREATE TABLE admin_users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- club_members: public read, admin write
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read members"
  ON club_members FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can insert/update/delete members"
  ON club_members FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- audition_registrations: anyone can insert (register), only admins can read
ALTER TABLE audition_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit registration"
  ON audition_registrations FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can read all registrations"
  ON audition_registrations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update registrations"
  ON audition_registrations FOR UPDATE
  USING (auth.role() = 'authenticated');


-- admin_users: only self can read
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read own record"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- Add email column
-- Drop the old constraint that was blocking across all types
ALTER TABLE audition_registrations DROP CONSTRAINT unique_phone;

-- New constraint: unique per phone + registration_type combination
ALTER TABLE audition_registrations ADD CONSTRAINT unique_phone_per_type UNIQUE (phone_number, registration_type);

-- ============================================================
-- EXTENDED SCHEMA — run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- CURRENT TEAM MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  roll_number   TEXT,
  year          INTEGER CHECK (year BETWEEN 1 AND 5),  -- year of study: 1=Member, 2=Executive, 3=Core, 4=Head
  branch        TEXT,
  domain        TEXT NOT NULL DEFAULT 'musician',      -- 'musician' | 'management' | 'anchoring' | 'design' | 'other'
  role          TEXT,                                  -- e.g. "Lead Guitarist", "Event Head"
  instagram     TEXT,
  photo_url     TEXT,                                  -- Cloudinary URL
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_year ON team_members(year);
CREATE INDEX IF NOT EXISTS idx_team_domain ON team_members(domain);

-- RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read team_members" ON team_members FOR SELECT USING (TRUE);
CREATE POLICY "Admin write team_members" ON team_members FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- ACADEMIC YEARS (for history)
-- e.g. { label: '2024-25', start_year: 2024 }
-- ============================================================
CREATE TABLE IF NOT EXISTS academic_years (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label       TEXT NOT NULL UNIQUE,   -- '2024-25'
  start_year  INTEGER NOT NULL,       -- 2024
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read academic_years" ON academic_years FOR SELECT USING (TRUE);
CREATE POLICY "Admin write academic_years" ON academic_years FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- HISTORY: TEAM SNAPSHOTS
-- When current team is moved to history, members are copied here
-- ============================================================
CREATE TABLE IF NOT EXISTS history_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  roll_number     TEXT,
  study_year      INTEGER,   -- year of study at that time
  branch          TEXT,
  domain          TEXT,
  role            TEXT,
  instagram       TEXT,
  photo_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_year ON history_members(academic_year_id);

ALTER TABLE history_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read history_members" ON history_members FOR SELECT USING (TRUE);
CREATE POLICY "Admin write history_members" ON history_members FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- HISTORY: PHOTO ALBUMS (per academic year)
-- ============================================================
CREATE TABLE IF NOT EXISTS history_photos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  cloudinary_url  TEXT NOT NULL,
  caption         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE history_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read history_photos" ON history_photos FOR SELECT USING (TRUE);
CREATE POLICY "Admin write history_photos" ON history_photos FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- AUDITION ARCHIVE
-- Registrations moved here after auditions close
-- ============================================================
CREATE TABLE IF NOT EXISTS audition_archive (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year_id    UUID REFERENCES academic_years(id),
  academic_year_label TEXT,   -- denormalized for easy display
  full_name           TEXT,
  email               TEXT,
  roll_number         TEXT,
  branch              TEXT,
  year                TEXT,
  phone_number        TEXT,
  registration_type   TEXT,
  languages           TEXT,
  backing_track_links TEXT,
  instruments         TEXT[],
  needs_instrument    BOOLEAN,
  remarks             TEXT,
  submitted_at        TIMESTAMPTZ,
  archived_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archive_year ON audition_archive(academic_year_id);

ALTER TABLE audition_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all audition_archive" ON audition_archive FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

  CREATE POLICY "Admins can delete registrations" 
  ON audition_registrations FOR DELETE 
  USING (auth.role() = 'authenticated');

-- 1. Drop the old single column constraint if you added it earlier
ALTER TABLE audition_registrations 
DROP CONSTRAINT IF EXISTS unique_roll_number;

-- 2. Create a composite constraint allowing one row per combination
ALTER TABLE audition_registrations 
ADD CONSTRAINT unique_roll_and_type UNIQUE (roll_number, registration_type);

-- Disable RLS temporarily to confirm this is the issue
-- Disable RLS for active roster tables
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE history_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE history_photos DISABLE ROW LEVEL SECURITY;

-- Disable RLS for audition pipeline tables
ALTER TABLE audition_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE audition_archive DISABLE ROW LEVEL SECURITY;

 

 CREATE TABLE public.club_memberships (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    member_id uuid NOT NULL,
    academic_year text NOT NULL, -- E.g., '2025-26'
    year_of_study integer NOT NULL, -- 1st, 2nd, 3rd, 4th year
    domain text NOT NULL DEFAULT 'musician'::text,
    role text NULL DEFAULT 'Member'::text,
    is_active boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT now(),
    
    CONSTRAINT club_memberships_pkey PRIMARY KEY (id),
    CONSTRAINT fk_membership_member FOREIGN KEY (member_id) 
        REFERENCES public.team_members(id) ON DELETE CASCADE,
    CONSTRAINT club_memberships_year_check CHECK ((year_of_study >= 1) AND (year_of_study <= 5)),
    CONSTRAINT unique_member_per_academic_year UNIQUE (member_id, academic_year)
);

-- High-performance indexes for your dashboard queries
CREATE INDEX IF NOT EXISTS idx_membership_academic_year ON public.club_memberships(academic_year);
CREATE INDEX IF NOT EXISTS idx_membership_is_active ON public.club_memberships(is_active);


INSERT INTO public.club_memberships (member_id, academic_year, year_of_study, domain, role, is_active)
SELECT 
  id as member_id, 
  '2025-26' as academic_year, -- Change this to whatever your current academic year string is
  coalesce(year, 1) as year_of_study, 
  domain, 
  role, 
  coalesce(is_active, true) as is_active
FROM public.team_members;

ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON public.club_memberships 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.club_memberships 
FOR INSERT 
WITH CHECK (true);

ALTER TABLE public.team_members DROP COLUMN is_active;

-- 1. Enable RLS on the table (if not already enabled)
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting update policies if they exist to prevent duplication errors
DROP POLICY IF EXISTS "Allow authenticated users to update memberships" ON club_memberships;
DROP POLICY IF EXISTS "Allow authenticated users to delete memberships" ON club_memberships;

-- 3. Create a clean policy that allows authenticated administrators to update rows
CREATE POLICY "Allow authenticated users to update memberships" 
ON club_memberships
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Create a clean policy that allows authenticated administrators to delete rows
CREATE POLICY "Allow authenticated users to delete memberships" 
ON club_memberships
FOR DELETE 
TO authenticated
USING (true);