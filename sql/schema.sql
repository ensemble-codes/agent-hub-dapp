-- Main database schema file
-- This file imports all individual schema files in the correct order

-- Import users table and related functions
\i sql/01-users.sql

-- Import access codes table
\i sql/02-access-codes.sql

-- Import requested access table
\i sql/03-requested-access.sql

-- Add any additional schema-wide configurations here if needed
