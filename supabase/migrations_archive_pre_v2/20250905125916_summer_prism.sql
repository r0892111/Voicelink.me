\n\n-- Add odoo_database column to odoo_users table\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_name = 'odoo_users' AND column_name = 'odoo_database'\n  ) THEN\n    ALTER TABLE odoo_users ADD COLUMN odoo_database text;
\n  END IF;
\nEND $$;
\n\n-- Add index for better query performance\nCREATE INDEX IF NOT EXISTS idx_odoo_users_database ON odoo_users(odoo_database);
;
