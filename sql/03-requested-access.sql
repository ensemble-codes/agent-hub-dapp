-- Requested Access table schema
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
