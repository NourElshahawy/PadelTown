-- InstaPadel — CRITICAL: creates the profiles row automatically on signup.
-- Run this in the InstaPadel project's SQL Editor NOW if you haven't already.
--
-- Without this, every new signup leaves auth.users with no matching
-- profiles row. Several places in the app assume that row already exists
-- right after signup (CompleteProfileForm, the avatar-upload step in
-- signUpPlayer, the auth/callback route's .single() profile lookup), so
-- signups are effectively broken without this trigger.
--
-- Ported verbatim from PadelGo's public.handle_new_user() / on_auth_user_created.

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, name, phone, email, role, owner_status)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'player'),
    case when new.raw_user_meta_data->>'role' = 'owner' then 'approved' else null end
  );
  return new;
end;
$function$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
