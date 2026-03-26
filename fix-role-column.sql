-- Simple fix for role column issue
-- This SQL can be run manually if needed

-- Check if role column exists and add it if it doesn't
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'developer';

-- Update existing users
UPDATE users SET role = 'developer' WHERE role IS NULL;
