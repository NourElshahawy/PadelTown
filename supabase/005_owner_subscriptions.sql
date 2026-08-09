-- PadelTown — owner subscription system (fixed price, manual approval).
-- Run this in the SQL Editor after 004_multitenancy_security_fixes.sql.
--
-- Design:
--   - `subscriptions` is a history table (one row per request/period), not a
--     single mutable field on profiles — an owner renews multiple times over
--     the platform's life, and admin needs to see that history.
--   - New owners get an automatic 14-day 'trial' row on signup (via
--     handle_new_user(), updated below) so they can use the platform
--     immediately without waiting on admin approval.
--   - "Expired" is never written by a background job (there is no cron here)
--     — it's computed live from ends_at whenever it matters: the
--     owner_has_active_subscription() function checks ends_at > now()
--     directly, and the app treats status='trial'/'active' with a past
--     ends_at as effectively expired for display purposes. The stored
--     `status` column reflects the last owner/admin action (trial granted,
--     payment submitted, approved, rejected) — not a live clock.
--   - Public venue/court visibility is gated on this at the RLS level, so
--     "hide expired owners from search" needs no app-code changes: it's
--     enforced everywhere venues/courts are read, not just the courts
--     listing page.

CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status = ANY (ARRAY['trial'::text, 'pending_payment'::text, 'active'::text, 'rejected'::text])),
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  payment_method text,
  payment_proof_url text,
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT subscriptions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own subscriptions" ON public.subscriptions FOR SELECT TO public
  USING (auth.uid() = owner_id);

-- Owners can only ever submit a pending request themselves — approving to
-- 'active'/'trial', setting ends_at, or rejecting is admin-only (see below).
CREATE POLICY "Owners can submit subscription payment" ON public.subscriptions FOR INSERT TO public
  WITH CHECK (auth.uid() = owner_id AND status = 'pending_payment' AND ends_at IS NULL AND reviewed_by IS NULL);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT TO public
  USING (is_admin());

CREATE POLICY "Admins can update subscriptions" ON public.subscriptions FOR UPDATE TO public
  USING (is_admin());

-- ============================================================
-- Function: does this owner currently have platform access?
-- ============================================================

CREATE OR REPLACE FUNCTION public.owner_has_active_subscription(check_owner_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE owner_id = check_owner_id
      AND status IN ('trial', 'active')
      AND ends_at IS NOT NULL
      AND ends_at > now()
  );
$function$;

-- ============================================================
-- Gate public venue/court visibility on an active subscription
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view approved venues" ON public.venues;
CREATE POLICY "Anyone can view approved venues with active subscription" ON public.venues FOR SELECT TO public
  USING (status = 'approved' AND public.owner_has_active_subscription(owner_id));

DROP POLICY IF EXISTS "Anyone can view courts of approved venues" ON public.courts;
CREATE POLICY "Anyone can view courts of approved venues with active subscription" ON public.courts FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id = courts.venue_id
      AND venues.status = 'approved'
      AND public.owner_has_active_subscription(venues.owner_id)
  ));

-- Note: "Owners can view own venues" / "Owners can manage own courts" are
-- untouched — an owner with an expired subscription still has full access
-- to their own dashboard to manage venues/courts and renew. Only PUBLIC
-- visibility is gated.

-- ============================================================
-- Auto-grant a 14-day trial to new owners on signup
-- ============================================================

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

  if new.raw_user_meta_data->>'role' = 'owner' then
    insert into public.subscriptions (owner_id, status, starts_at, ends_at)
    values (new.id, 'trial', now(), now() + interval '14 days');
  end if;

  return new;
end;
$function$;

-- Backfill: existing owners (signed up before this migration) get the same
-- 14-day trial starting now, so nobody is locked out immediately.
INSERT INTO public.subscriptions (owner_id, status, starts_at, ends_at)
SELECT id, 'trial', now(), now() + interval '14 days'
FROM public.profiles
WHERE role = 'owner'
  AND NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE subscriptions.owner_id = profiles.id);

-- ============================================================
-- Make yourself an admin (required — nothing else grants this role)
-- ============================================================
-- update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
