-- Add username and password columns to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add comment
COMMENT ON COLUMN employees.username IS 'Username for employee login';
COMMENT ON COLUMN employees.password IS 'Password for employee login (plain text for demo, should be hashed in production)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
