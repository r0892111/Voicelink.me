CREATE OR REPLACE FUNCTION public.clear_test_user_tl_link(phone_in text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE test_users SET tl_user_id = NULL, updated_at = now() WHERE phone = phone_in;
END;
$function$;

CREATE OR REPLACE FUNCTION public.current_billing_customer()
 RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  WITH me AS (
    SELECT user_id, is_admin, admin_user_id, stripe_customer_id
    FROM teamleader_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL
    LIMIT 1
  )
  SELECT COALESCE(
    (SELECT stripe_customer_id FROM me WHERE is_admin = true),
    (SELECT admin.stripe_customer_id
       FROM me
       JOIN teamleader_users admin
         ON admin.user_id = me.admin_user_id
        AND admin.is_admin = true
        AND admin.deleted_at IS NULL)
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_by_teamleader_id(tl_id text)
 RETURNS TABLE(id uuid, name text, email text, display_name text, teamleader_id text, language text, timezone text, status text, created_at timestamp with time zone, updated_at timestamp with time zone, last_login timestamp with time zone)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.email, u.display_name, u.teamleader_id, u.language, u.timezone, u.status, u.created_at, u.updated_at, u.last_login
  FROM users u
  WHERE u.teamleader_id = tl_id AND u.status = 'active';
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, name, email, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email, NOW(), NOW());
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RAISE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.lookup_test_user_by_phone(phone_in text)
 RETURNS TABLE(user_id text, whatsapp_status text, tl_user_id text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT user_id, whatsapp_status, tl_user_id FROM test_users WHERE phone = phone_in LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.mirror_oauth_token_to_teamleader_users()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  if new.provider = 'teamleader' then
    update public.teamleader_users
       set access_token = new.access_token, refresh_token = new.refresh_token, token_expires_at = new.expires_at, updated_at = now()
     where user_id::text = new.user_id;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.remember_entity_memory(p_teamleader_id text, p_search_term text, p_canonical_name text, p_entity_id text, p_entity_type text, p_parent_entity_id text DEFAULT NULL::text, p_parent_entity_type text DEFAULT NULL::text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO entity_memory (teamleader_id, search_term, canonical_name, entity_id, entity_type, parent_entity_id, parent_entity_type, hit_count, last_seen)
    VALUES (p_teamleader_id, p_search_term, p_canonical_name, p_entity_id, p_entity_type, p_parent_entity_id, p_parent_entity_type, 1, now())
    ON CONFLICT (teamleader_id, search_term) DO UPDATE SET
        canonical_name = EXCLUDED.canonical_name, entity_id = EXCLUDED.entity_id, entity_type = EXCLUDED.entity_type,
        parent_entity_id = COALESCE(EXCLUDED.parent_entity_id, entity_memory.parent_entity_id),
        parent_entity_type = COALESCE(EXCLUDED.parent_entity_type, entity_memory.parent_entity_type),
        hit_count = entity_memory.hit_count + 1, last_seen = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.remember_entity_memory(p_teamleader_id text, p_search_term text, p_canonical_name text, p_entity_id text, p_entity_type text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO entity_memory (teamleader_id, search_term, canonical_name, entity_id, entity_type, hit_count, last_seen)
    VALUES (p_teamleader_id, p_search_term, p_canonical_name, p_entity_id, p_entity_type, 1, now())
    ON CONFLICT (teamleader_id, search_term) DO UPDATE SET
        canonical_name = EXCLUDED.canonical_name, entity_id = EXCLUDED.entity_id, entity_type = EXCLUDED.entity_type,
        hit_count = entity_memory.hit_count + 1, last_seen = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_last_login()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO ''
AS $function$
BEGIN
  NEW.last_login = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- triggers
CREATE TRIGGER trg_mirror_oauth_token_to_tu AFTER INSERT OR UPDATE OF access_token, refresh_token, expires_at ON public.oauth_tokens FOR EACH ROW EXECUTE FUNCTION mirror_oauth_token_to_teamleader_users();
CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON public.oauth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER teamleader_users_updated_at BEFORE UPDATE ON public.teamleader_users FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
