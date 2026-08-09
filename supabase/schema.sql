-- PadelTown — database schema, originally ported from the PadelGo project.
--
-- For a fresh project, run in this exact order:
--   1. schema.sql (this file)
--   2. storage_setup.sql
--   3. 002_add_sport_type.sql
--   4. 003_profile_creation_trigger.sql (superseded by 005, but harmless to run)
--   5. 004_multitenancy_security_fixes.sql
--   6. 005_owner_subscriptions.sql (overrides some of this file's venues/courts
--      policies and handle_new_user())
--   7. 006_trial_abuse_prevention.sql (overrides handle_new_user() again)
--   8. 007_remove_owner_status.sql (drops profiles.owner_status, overrides
--      handle_new_user() one more time)
--   9. 008_demo_venues.sql (adds is_demo/is_hidden/city to venues, overrides
--      venues/courts/bookings policies again, seeds the demo venues — run it last)
--
-- Fixed vs. the raw "Schema Visualizer" export:
--   - `ARRAY` is not a valid standalone type; changed to `text[]` (amenities, images)
--   - Table order verified to satisfy FK dependencies (creates parent tables first)
--   - Added `ENABLE ROW LEVEL SECURITY` on every table (was implicit in the source
--     project; a fresh Supabase project defaults to RLS OFF, which would leave every
--     table world-readable/writable via the anon key until policies are added)
--
-- All 3 functions (email_exists, get_court_booking_count, is_admin) and all
-- 59 RLS policies across the 15 tables are included below, pulled from
-- PadelGo's pg_policies/pg_proc catalogs. This file matches PadelGo's schema
-- as originally ported; later-numbered files layer PadelTown-specific
-- changes on top (multi-sport, security fixes, subscriptions).

create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  phone text,
  role text NOT NULL DEFAULT 'player'::text CHECK (role = ANY (ARRAY['player'::text, 'owner'::text, 'admin'::text])),
  owner_status text CHECK (owner_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  email text,
  avatar_url text,
  avg_rating numeric,
  ratings_count integer DEFAULT 0,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.venues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  description text,
  amenities text[] DEFAULT '{}'::text[],
  weekday_open time without time zone,
  weekday_close time without time zone,
  friday_open time without time zone,
  friday_close time without time zone,
  cancellation_policy text DEFAULT 'flexible'::text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT venues_pkey PRIMARY KEY (id),
  CONSTRAINT venues_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.courts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'regular'::text CHECK (type = ANY (ARRAY['regular'::text, 'panoramic'::text, 'indoor'::text, 'outdoor'::text])),
  sport_type text NOT NULL DEFAULT 'padel'::text CHECK (sport_type = ANY (ARRAY['padel'::text, 'football'::text, 'tennis'::text])),
  price_per_hour numeric NOT NULL,
  images text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT courts_pkey PRIMARY KEY (id),
  CONSTRAINT courts_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);

CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  court_id uuid,
  venue_name text NOT NULL,
  court_name text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['confirmed'::text, 'cancelled'::text, 'completed'::text])),
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text])),
  created_at timestamp with time zone DEFAULT now(),
  reviewed boolean DEFAULT false,
  group_id uuid,
  payment_claimed_at timestamp with time zone,
  payment_proof_url text,
  cancelled_at timestamp with time zone,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.tournaments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organizer_id uuid,
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['single'::text, 'double'::text])),
  status text NOT NULL DEFAULT 'registration'::text CHECK (status = ANY (ARRAY['registration'::text, 'ready'::text, 'live'::text, 'completed'::text])),
  venue_name text NOT NULL,
  court_id uuid,
  tournament_date date NOT NULL,
  max_teams integer NOT NULL CHECK (max_teams >= 4 AND (max_teams & (max_teams - 1)) = 0),
  entry_fee numeric,
  registration_deadline date,
  champion_team_name text,
  starts_at timestamp with time zone,
  first_match_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  organizer_email text,
  CONSTRAINT tournaments_pkey PRIMARY KEY (id),
  CONSTRAINT tournaments_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id),
  CONSTRAINT tournaments_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.tournament_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL,
  captain_id uuid,
  name text NOT NULL,
  captain_name text NOT NULL,
  captain_phone text NOT NULL,
  partner_name text,
  status text NOT NULL DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['confirmed'::text, 'pending'::text])),
  created_at timestamp with time zone DEFAULT now(),
  captain_email text,
  CONSTRAINT tournament_teams_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_teams_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id),
  CONSTRAINT tournament_teams_captain_id_fkey FOREIGN KEY (captain_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.tournament_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL,
  round text NOT NULL,
  round_index integer NOT NULL,
  match_index integer NOT NULL,
  team_a_name text,
  team_b_name text,
  score_a integer,
  score_b integer,
  is_done boolean DEFAULT false,
  is_live boolean DEFAULT false,
  match_time timestamp with time zone,
  CONSTRAINT tournament_matches_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_matches_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id)
);

CREATE TABLE public.partner_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  court_id uuid,
  court_name text NOT NULL,
  request_date date NOT NULL,
  time_label text NOT NULL,
  level text NOT NULL CHECK (level = ANY (ARRAY['مبتدئ'::text, 'متوسط'::text, 'محترف'::text])),
  players_needed integer NOT NULL DEFAULT 1,
  notes text,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'partially_filled'::text, 'matched'::text, 'expired'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partner_requests_pkey PRIMARY KEY (id),
  CONSTRAINT partner_requests_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id),
  CONSTRAINT partner_requests_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.partner_request_joins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  player_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partner_request_joins_pkey PRIMARY KEY (id),
  CONSTRAINT partner_request_joins_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.partner_requests(id),
  CONSTRAINT partner_request_joins_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type = ANY (ARRAY['tournament'::text, 'partner_request'::text, 'owner_post'::text, 'admin_post'::text])),
  source_id uuid,
  author_id uuid,
  title text NOT NULL,
  body text,
  image_url text,
  status text NOT NULL DEFAULT 'published'::text CHECK (status = ANY (ARRAY['pending'::text, 'published'::text, 'rejected'::text])),
  category text NOT NULL DEFAULT 'announcement'::text CHECK (category = ANY (ARRAY['tournament'::text, 'partnership'::text, 'announcement'::text, 'maintenance'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.court_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL,
  user_id uuid,
  booking_id uuid UNIQUE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  site_feedback text,
  CONSTRAINT court_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT court_reviews_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id),
  CONSTRAINT court_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT court_reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);

CREATE TABLE public.player_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_request_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  reviewed_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  showed_up boolean DEFAULT true,
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT player_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT player_reviews_partner_request_id_fkey FOREIGN KEY (partner_request_id) REFERENCES public.partner_requests(id),
  CONSTRAINT player_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id),
  CONSTRAINT player_reviews_reviewed_id_fkey FOREIGN KEY (reviewed_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.booking_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  court_id uuid NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  status text NOT NULL,
  group_id uuid,
  CONSTRAINT booking_slots_pkey PRIMARY KEY (id),
  CONSTRAINT booking_slots_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.blocked_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blocked_slots_pkey PRIMARY KEY (id),
  CONSTRAINT blocked_slots_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id),
  CONSTRAINT blocked_slots_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- ============================================================
-- Enable RLS (locked down — zero policies until supplied)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_request_joins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Functions (must exist before policies below, since several
-- policies call is_admin())
-- ============================================================

CREATE OR REPLACE FUNCTION public.email_exists(check_email text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select exists(select 1 from auth.users where email = check_email);
$function$
;

CREATE OR REPLACE FUNCTION public.get_court_booking_count(target_court_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select count(*)::integer
  from bookings
  where court_id = target_court_id
  and status != 'cancelled';
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$function$
;

-- ============================================================
-- RLS policies
-- ============================================================

-- blocked_slots
CREATE POLICY blocked_slots_owner_delete ON public.blocked_slots AS PERMISSIVE FOR DELETE TO public
  USING ((EXISTS ( SELECT 1
   FROM (courts c
     JOIN venues v ON ((v.id = c.venue_id)))
  WHERE ((c.id = blocked_slots.court_id) AND (v.owner_id = auth.uid())))));

CREATE POLICY blocked_slots_owner_insert ON public.blocked_slots AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (courts c
     JOIN venues v ON ((v.id = c.venue_id)))
  WHERE ((c.id = blocked_slots.court_id) AND (v.owner_id = auth.uid())))));

CREATE POLICY blocked_slots_select_all ON public.blocked_slots AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY owners_delete_blocked_slots ON public.blocked_slots AS PERMISSIVE FOR DELETE TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM (courts c
     JOIN venues v ON ((v.id = c.venue_id)))
  WHERE ((c.id = blocked_slots.court_id) AND (v.owner_id = auth.uid())))));

CREATE POLICY owners_insert_blocked_slots ON public.blocked_slots AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (courts c
     JOIN venues v ON ((v.id = c.venue_id)))
  WHERE ((c.id = blocked_slots.court_id) AND (v.owner_id = auth.uid())))));

CREATE POLICY owners_select_blocked_slots ON public.blocked_slots AS PERMISSIVE FOR SELECT TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM (courts c
     JOIN venues v ON ((v.id = c.venue_id)))
  WHERE ((c.id = blocked_slots.court_id) AND (v.owner_id = auth.uid())))));

-- booking_slots
CREATE POLICY "Authenticated users can view slot status" ON public.booking_slots AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);

-- bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings AS PERMISSIVE FOR SELECT TO public
  USING (is_admin());

CREATE POLICY "Owners can update bookings on their courts" ON public.bookings AS PERMISSIVE FOR UPDATE TO public
  USING ((EXISTS ( SELECT 1
   FROM (courts
     JOIN venues ON ((venues.id = courts.venue_id)))
  WHERE ((courts.id = bookings.court_id) AND (venues.owner_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (courts
     JOIN venues ON ((venues.id = courts.venue_id)))
  WHERE ((courts.id = bookings.court_id) AND (venues.owner_id = auth.uid())))));

CREATE POLICY "Owners can view bookings on their courts" ON public.bookings AS PERMISSIVE FOR SELECT TO public
  USING ((EXISTS ( SELECT 1
   FROM (courts
     JOIN venues ON ((venues.id = courts.venue_id)))
  WHERE ((courts.id = bookings.court_id) AND (venues.owner_id = auth.uid())))));

CREATE POLICY "Users can create own bookings" ON public.bookings AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update own bookings" ON public.bookings AS PERMISSIVE FOR UPDATE TO public
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view own bookings" ON public.bookings AS PERMISSIVE FOR SELECT TO public
  USING ((auth.uid() = user_id));

-- court_reviews
CREATE POLICY "Admins can view all reviews" ON public.court_reviews AS PERMISSIVE FOR SELECT TO public
  USING (is_admin());

CREATE POLICY "Anyone can view reviews" ON public.court_reviews AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can review their own bookings" ON public.court_reviews AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM bookings
  WHERE ((bookings.id = court_reviews.booking_id) AND (bookings.user_id = auth.uid()))))));

-- courts
CREATE POLICY "Admins can view all courts" ON public.courts AS PERMISSIVE FOR SELECT TO public
  USING (is_admin());

CREATE POLICY "Anyone can view courts of approved venues" ON public.courts AS PERMISSIVE FOR SELECT TO public
  USING ((EXISTS ( SELECT 1
   FROM venues
  WHERE ((venues.id = courts.venue_id) AND (venues.status = 'approved'::text)))));

CREATE POLICY "Owners can manage own courts" ON public.courts AS PERMISSIVE FOR ALL TO public
  USING ((EXISTS ( SELECT 1
   FROM venues
  WHERE ((venues.id = courts.venue_id) AND (venues.owner_id = auth.uid())))));

-- news
CREATE POLICY "Admins can create news" ON public.news AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (((auth.uid() = author_id) AND (source_type = 'admin_post'::text) AND is_admin()));

CREATE POLICY "Anyone can view published news" ON public.news AS PERMISSIVE FOR SELECT TO public
  USING ((status = 'published'::text));

CREATE POLICY "Approved owners can create news" ON public.news AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (((auth.uid() = author_id) AND (source_type = 'owner_post'::text) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'owner'::text))))));

CREATE POLICY "Authors can delete own news" ON public.news AS PERMISSIVE FOR DELETE TO public
  USING ((auth.uid() = author_id));

CREATE POLICY "Authors can update own news" ON public.news AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((auth.uid() = author_id));

CREATE POLICY "Owners can view own news" ON public.news AS PERMISSIVE FOR SELECT TO public
  USING ((auth.uid() = author_id));

CREATE POLICY "System can insert automatic news" ON public.news AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((source_type = ANY (ARRAY['tournament'::text, 'partner_request'::text])));

-- notifications
CREATE POLICY notifications_insert_authenticated ON public.notifications AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY notifications_select_own ON public.notifications AS PERMISSIVE FOR SELECT TO public
  USING ((auth.uid() = user_id));

CREATE POLICY notifications_update_own ON public.notifications AS PERMISSIVE FOR UPDATE TO public
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

-- partner_request_joins
CREATE POLICY "Anyone can view joins" ON public.partner_request_joins AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated users can join requests" ON public.partner_request_joins AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((auth.uid() = player_id));

CREATE POLICY "Hosts can update joins on their requests" ON public.partner_request_joins AS PERMISSIVE FOR UPDATE TO public
  USING ((EXISTS ( SELECT 1
   FROM partner_requests
  WHERE ((partner_requests.id = partner_request_joins.request_id) AND (partner_requests.host_id = auth.uid())))));

-- partner_requests
CREATE POLICY "Anyone can view open requests" ON public.partner_requests AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated users can create requests" ON public.partner_requests AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((auth.uid() = host_id));

CREATE POLICY "Hosts can update own requests" ON public.partner_requests AS PERMISSIVE FOR UPDATE TO public
  USING ((auth.uid() = host_id));

-- player_reviews
CREATE POLICY "Anyone can view player reviews" ON public.player_reviews AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can submit reviews for their matches" ON public.player_reviews AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((auth.uid() = reviewer_id));

-- profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO public
  USING (is_admin());

CREATE POLICY "Owners can view profiles of their customers" ON public.profiles AS PERMISSIVE FOR SELECT TO public
  USING ((EXISTS ( SELECT 1
   FROM ((bookings
     JOIN courts ON ((courts.id = bookings.court_id)))
     JOIN venues ON ((venues.id = courts.venue_id)))
  WHERE ((bookings.user_id = profiles.id) AND (venues.owner_id = auth.uid())))));

CREATE POLICY "Partner match participants can view each other's profile" ON public.profiles AS PERMISSIVE FOR SELECT TO public
  USING (((EXISTS ( SELECT 1
   FROM (partner_request_joins prj
     JOIN partner_requests pr ON ((pr.id = prj.request_id)))
  WHERE ((prj.player_id = profiles.id) AND (pr.host_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (partner_requests pr
     JOIN partner_request_joins prj ON ((prj.request_id = pr.id)))
  WHERE ((pr.host_id = profiles.id) AND (prj.player_id = auth.uid()))))));

CREATE POLICY "Teammates in same partner request can view each other" ON public.profiles AS PERMISSIVE FOR SELECT TO public
  USING ((EXISTS ( SELECT 1
   FROM (partner_request_joins my_join
     JOIN partner_request_joins other_join ON ((other_join.request_id = my_join.request_id)))
  WHERE ((my_join.player_id = auth.uid()) AND (other_join.player_id = profiles.id)))));

CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO public
  USING ((auth.uid() = id));

CREATE POLICY "Users can view own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO public
  USING ((auth.uid() = id));

-- tournament_matches
CREATE POLICY "Anyone can view matches" ON public.tournament_matches AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "Organizers can manage matches" ON public.tournament_matches AS PERMISSIVE FOR ALL TO public
  USING ((EXISTS ( SELECT 1
   FROM tournaments
  WHERE ((tournaments.id = tournament_matches.tournament_id) AND (tournaments.organizer_id = auth.uid())))));

-- tournament_teams
CREATE POLICY "Admins can view all teams" ON public.tournament_teams AS PERMISSIVE FOR SELECT TO public
  USING (is_admin());

CREATE POLICY "Anyone can view teams" ON public.tournament_teams AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated users can join as team" ON public.tournament_teams AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((auth.uid() IS NOT NULL));

-- tournaments
CREATE POLICY "Anyone can view tournaments" ON public.tournaments AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "Authenticated users can create tournaments" ON public.tournaments AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((auth.uid() = organizer_id));

CREATE POLICY "Organizers can update own tournaments" ON public.tournaments AS PERMISSIVE FOR UPDATE TO public
  USING ((auth.uid() = organizer_id));

-- venues
CREATE POLICY "Admins can update any venue" ON public.venues AS PERMISSIVE FOR UPDATE TO public
  USING (is_admin());

CREATE POLICY "Admins can view all venues" ON public.venues AS PERMISSIVE FOR SELECT TO public
  USING (is_admin());

CREATE POLICY "Anyone can view approved venues" ON public.venues AS PERMISSIVE FOR SELECT TO public
  USING ((status = 'approved'::text));

CREATE POLICY "Owners can insert own venues" ON public.venues AS PERMISSIVE FOR INSERT TO public
  WITH CHECK ((auth.uid() = owner_id));

CREATE POLICY "Owners can update own venues" ON public.venues AS PERMISSIVE FOR UPDATE TO public
  USING ((auth.uid() = owner_id));

CREATE POLICY "Owners can view own venues" ON public.venues AS PERMISSIVE FOR SELECT TO public
  USING ((auth.uid() = owner_id));

-- ============================================================
-- Profile auto-creation on signup (must exist for signups to work)
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
  return new;
end;
$function$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- booking_slots sync (multi-tenancy fix — see 004_multitenancy_security_fixes.sql
-- for the full explanation). Keeps a narrow, safe-to-expose-broadly mirror
-- of bookings (court_id/date/time/status only, no customer data) so public
-- availability checks don't need broad read access to the real bookings table.
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_booking_slot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;

CREATE TRIGGER on_booking_change
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.sync_booking_slot();
