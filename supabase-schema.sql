-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    wallet_address VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    otp_verified_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON public.users(is_verified);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Users can read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow insert for new users (will be restricted by email verification)
CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 


--------------------------------

-- 1) Table
CREATE TABLE IF NOT EXISTS access_codes (
  id               BIGSERIAL PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,          -- 6-char A–Z0–9
  max_redemptions  INT  NOT NULL DEFAULT 1,       -- single-use by default
  times_redeemed   INT  NOT NULL DEFAULT 0,
  disabled         BOOLEAN NOT NULL DEFAULT FALSE,

  redeemed_email   TEXT,                          -- keep original casing
  redeemed_at      TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Case-insensitive: one redemption per email globally
CREATE UNIQUE INDEX IF NOT EXISTS uq_access_codes_redeemed_email_once
  ON access_codes (lower(redeemed_email))
  WHERE redeemed_email IS NOT NULL;

-- 3) Keep counters sane (idempotent add of CHECK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_access_codes_caps'
      AND conrelid = 'access_codes'::regclass
  ) THEN
    ALTER TABLE access_codes
      ADD CONSTRAINT chk_access_codes_caps
      CHECK (times_redeemed >= 0 AND times_redeemed <= max_redemptions);
  END IF;
END
$$;

-- 4) Enforce the 6-character A–Z0–9 format (idempotent add of CHECK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_access_codes_code_format'
      AND conrelid = 'access_codes'::regclass
  ) THEN
    ALTER TABLE access_codes
      ADD CONSTRAINT chk_access_codes_code_format
      CHECK (code ~ '^[A-Z0-9]{6}$');
  END IF;
END
$$;


--------------------------------

-- Requested Access table
CREATE TABLE IF NOT EXISTS requested_access (
  id               BIGSERIAL PRIMARY KEY,
  email            TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on email to prevent duplicate requests
CREATE UNIQUE INDEX IF NOT EXISTS uq_requested_access_email
  ON requested_access (lower(email));

-- Enable Row Level Security (RLS)
ALTER TABLE requested_access ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for access requests)
CREATE POLICY "Allow access requests" ON requested_access
    FOR INSERT WITH CHECK (true);

-- Only allow admin to view requests
CREATE POLICY "Admin can view access requests" ON requested_access
    FOR SELECT USING (false); -- This will be overridden by admin client


--------------------------------
