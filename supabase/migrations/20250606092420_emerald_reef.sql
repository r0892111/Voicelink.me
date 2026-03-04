\n\n-- Drop and recreate the handle_new_user function with proper error handling\nCREATE OR REPLACE FUNCTION handle_new_user()\nRETURNS TRIGGER AS $$\nBEGIN\n  INSERT INTO public.users (id, name, email, created_at, updated_at)\n  VALUES (\n    NEW.id,\n    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), -- Use name from metadata or fallback to email\n    NEW.email,\n    NOW(),\n    NOW()\n  );
\n  RETURN NEW;
\nEXCEPTION\n  WHEN OTHERS THEN\n    -- Log the error and re-raise it\n    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
\n    RAISE;
\nEND;
\n$$ LANGUAGE plpgsql SECURITY DEFINER;
\n\n-- Ensure the trigger exists and is properly configured\nDROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
\nCREATE TRIGGER on_auth_user_created\n  AFTER INSERT ON auth.users\n  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
;
