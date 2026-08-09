-- PadelTown — remove the vestigial profiles.owner_status column.
-- Run this in the SQL Editor after 006_trial_abuse_prevention.sql.
--
-- owner_status (pending/approved/rejected) is leftover from PadelGo's
-- original single-venue setup. It's fetched in 3 places (useAuth.js,
-- auth/callback/route.js, LoginForm.jsx) but never branched on anywhere --
-- the /owner/pending-approval page it was presumably meant to gate is a
-- no-op redirect straight back to the dashboard, and handle_new_user()
-- always sets it to 'approved' for new owners immediately.
--
-- Now that subscriptions.status (trial/pending_payment/active/rejected)
-- is the real gate on an owner's access, keeping owner_status around next
-- to it -- with overlapping "pending"/"approved"/"rejected" values that
-- mean nothing -- is exactly the kind of thing that confuses a future
-- read of this schema into thinking there are two independent approval
-- systems. There's only one now.

ALTER TABLE public.profiles DROP COLUMN IF EXISTS owner_status;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_identity_seen_before boolean;
begin
  insert into public.profiles (id, name, phone, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );

  if new.raw_user_meta_data->>'role' = 'owner' then
    select exists (
      select 1
      from public.subscriptions s
      join public.profiles p on p.id = s.owner_id
      where p.id <> new.id
        and (
          (new.raw_user_meta_data->>'phone' is not null and p.phone = new.raw_user_meta_data->>'phone')
          or (new.email is not null and p.email = new.email)
        )
    ) into v_identity_seen_before;

    if v_identity_seen_before then
      insert into public.subscriptions (owner_id, status)
      values (new.id, 'pending_payment');
    else
      insert into public.subscriptions (owner_id, status, starts_at, ends_at)
      values (new.id, 'trial', now(), now() + interval '7 days');
    end if;
  end if;

  return new;
end;
$function$;
