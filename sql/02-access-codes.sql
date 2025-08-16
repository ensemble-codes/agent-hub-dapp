-- Access Codes table schema
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
