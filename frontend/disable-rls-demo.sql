-- Disable Row Level Security (RLS) for demo/development
-- WARNING: Only use this for development/demo purposes!
-- For production, implement proper RLS policies instead.

-- Disable RLS on all tables
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON customers;

DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON employees;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON employees;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON employees;

DROP POLICY IF EXISTS "Enable read access for all users" ON transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transactions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON transactions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON transactions;

DROP POLICY IF EXISTS "Enable read access for all users" ON transaction_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transaction_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON transaction_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON transaction_items;

DROP POLICY IF EXISTS "Enable read access for all users" ON attendance;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON attendance;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON attendance;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON attendance;

-- Verify RLS is disabled
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'categories', 
        'products', 
        'customers', 
        'employees', 
        'transactions', 
        'transaction_items',
        'attendance'
    )
ORDER BY tablename;
