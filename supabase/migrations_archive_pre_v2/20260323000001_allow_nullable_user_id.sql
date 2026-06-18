-- Allow user_id to be null for invited team members who haven't signed up yet.
ALTER TABLE teamleader_users ALTER COLUMN user_id DROP NOT NULL;
