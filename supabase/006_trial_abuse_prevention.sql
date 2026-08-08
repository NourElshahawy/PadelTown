-- InstaPadel — shorten the free trial and close the repeat-trial loophole.
-- Run this in the SQL Editor after 005_owner_subscriptions.sql.
--
-- Two changes to handle_new_user():
--   1. Trial period: 14 days -> 7 days (new signups only; anyone already on
--      a 14-day trial from 005 keeps their original end date -- this only
--      changes what NEW rows get).
--   2. Before granting a trial, check whether any subscriptions row already
--      exists for a profile sharing this signup's phone or email (any
--      status -- trial, pending, active, rejected all count: the point is
--      "has this person had an owner account before", not "did they
--      specifically succeed at a trial before). If so, skip the trial
--      entirely and create the new subscription as 'pending_payment' --
--      they go straight to needing admin-approved payment.

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_identity_seen_before boolean;
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
