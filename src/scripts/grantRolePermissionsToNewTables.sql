-- When a new table is added in order to grant permissions to the new table for the read_write and read_only roles, run the following:
BEGIN;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO read_write;

DO $$
DECLARE 
  r RECORD;
BEGIN 
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ' || quote_ident(r.tablename) || ' TO read_write';
  END LOOP;
END $$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO read_only;

DO $$
DECLARE 
  r RECORD;
BEGIN 
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
    EXECUTE 'GRANT SELECT ON ' || quote_ident(r.tablename) || ' TO read_only';
  END LOOP;
END $$;

COMMIT;
-- To rollback if needed:
-- ROLLBACK;