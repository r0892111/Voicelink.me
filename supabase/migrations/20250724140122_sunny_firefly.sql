\n\n-- Add whatsapp_status column to users table\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_name = 'users' AND column_name = 'whatsapp_status'\n  ) THEN\n    ALTER TABLE users ADD COLUMN whatsapp_status text DEFAULT 'not_set';
\n  END IF;
\nEND $$;
\n\n-- Add check constraint for valid status values\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.check_constraints\n    WHERE constraint_name = 'users_whatsapp_status_check'\n  ) THEN\n    ALTER TABLE users ADD CONSTRAINT users_whatsapp_status_check \n    CHECK (whatsapp_status IN ('not_set', 'pending', 'active'));
\n  END IF;
\nEND $$;
\n\n-- Update existing users with null whatsapp_status to 'not_set'\nUPDATE users \nSET whatsapp_status = 'not_set' \nWHERE whatsapp_status IS NULL;
;
