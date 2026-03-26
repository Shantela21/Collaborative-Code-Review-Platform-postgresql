-- Add role column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'developer';
    END IF;
END
$$;

-- Update existing users to have a default role if they don't have one
UPDATE users SET role = 'developer' WHERE role IS NULL;

-- Add index for role column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
