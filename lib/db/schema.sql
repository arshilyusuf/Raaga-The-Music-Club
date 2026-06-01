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