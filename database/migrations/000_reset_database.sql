-- RESET DATABASE SCRIPT
-- Run this FIRST if you need to start over
-- This will drop ALL existing tables in the public schema

-- Drop all tables (this will drop everything including any unexpected tables)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_queue_number(VARCHAR, INT) CASCADE;
DROP FUNCTION IF EXISTS update_queue_positions() CASCADE;

-- Drop materialized view (if exists)
DROP MATERIALIZED VIEW IF EXISTS queue_statistics CASCADE;

-- Verify everything is dropped
SELECT 'Reset complete. All tables dropped.' AS status;

