-- PadelTown — multi-tenancy security audit fixes.
-- Run this in the SQL Editor. Two real cross-tenant leaks found, both at the
-- RLS layer (the app's own queries were already correctly scoped — these are
-- gaps that let anyone bypass the UI entirely via a direct Supabase call).

-- ============================================================
-- FIX 1 (CRITICAL): bookings exposed system-wide to any logged-in user
-- ============================================================
-- "Authenticated users can view slot availability" USING (true) meant ANY
-- authenticated user — any owner, any player — could run
-- `supabase.from('bookings').select('*')` directly and get every booking
-- ever made, across every venue and owner: customer names' user_id, prices,
-- payment_proof_url, dates. The app's own dashboard queries were always
-- correctly scoped by owner_id, but RLS is the actual security boundary —
-- a scoped app query doesn't stop a direct query from an authenticated
-- session, including another owner's.
--
-- This policy existed so ANY visitor could check "is this slot free" without
-- being the booking's owner. That's legitimate, but it doesn't need to
-- expose the full row — court_id/date/time/status is enough. Restoring
-- booking_slots as an actually-populated (via trigger, this time) narrow
-- mirror table serves that purpose without the leak. booking_slots has no
-- user_id, price, or payment_proof_url, so broad read access to it is safe.

CREATE OR REPLACE FUNCTION public.sync_booking_slot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  IF NEW.court_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.booking_slots (booking_id, court_id, date, time, status, group_id)
    VALUES (NEW.id, NEW.court_id, NEW.date, NEW.time, NEW.status, NEW.group_id);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.booking_slots
    SET status = NEW.status
    WHERE booking_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_change
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.sync_booking_slot();

-- Backfill: mirror any bookings that already exist (real production data
-- inserted before this trigger existed) so nothing is missing on day one.
INSERT INTO public.booking_slots (booking_id, court_id, date, time, status, group_id)
SELECT b.id, b.court_id, b.date, b.time, b.status, b.group_id
FROM public.bookings b
WHERE b.court_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.booking_slots bs WHERE bs.booking_id = b.id);

-- Now that booking_slots is actually reliable, remove the blanket bookings
-- policy. What's left: "Users can view own bookings" (auth.uid()=user_id),
-- "Owners can view bookings on their courts" (via courts/venues join),
-- "Admins can view all bookings" (is_admin()) — all correctly scoped.
DROP POLICY IF EXISTS "Authenticated users can view slot availability" ON public.bookings;

-- ============================================================
-- FIX 2: venues exposed ALL venues (incl. other owners' pending/rejected
-- applications) to literally anyone, unauthenticated included
-- ============================================================
-- Duplicate of "Anyone can view approved venues" but without the
-- status='approved' restriction, so it silently overrode the approval gate.
-- What's left after dropping it: "Anyone can view approved venues",
-- "Owners can view own venues" (any status, own only), "Admins can view all
-- venues" — the actually-intended model.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.venues;
