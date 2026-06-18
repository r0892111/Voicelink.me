\n\n-- Add WhatsApp number column to users table\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_name = 'users' AND column_name = 'whatsapp_number'\n  ) THEN\n    ALTER TABLE users ADD COLUMN whatsapp_number text;
\n  END IF;
\nEND $$;
\n\n-- Add index for WhatsApp number queries\nCREATE INDEX IF NOT EXISTS idx_users_whatsapp_number ON users(whatsapp_number);
\n\n-- Add comment for documentation\nCOMMENT ON COLUMN users.whatsapp_number IS 'User WhatsApp phone number for notifications and communication';
;
