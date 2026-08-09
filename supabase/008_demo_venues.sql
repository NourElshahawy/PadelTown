-- ============================================================
-- 008_demo_venues.sql
-- Run this AFTER 007_remove_owner_status.sql.
--
-- Adds "demo" showcase venues so the platform has something to show
-- a prospective venue owner before any real owner has subscribed.
-- Demo venues:
--   - have owner_id = NULL (no real paying tenant), so venues.owner_id
--     is relaxed to nullable
--   - are flagged is_demo = true and show a "تجريبي" badge in the UI
--   - bypass the active-subscription gate in the public SELECT policies
--     (they have no owner/subscription to check), but still respect
--     is_hidden and status = 'approved' like any other venue
--   - can never receive a real booking — enforced both client-side
--     (BookingPage shows a simulated-booking message instead of the
--     real flow) AND at the RLS level on public.bookings, so a request
--     sent directly to Supabase can't create a real booking on one either
--   - auto-hide (is_hidden = true, not deleted) the moment a real owner
--     with an active subscription adds a real court with the same
--     sport_type in the same city — see hide_matching_demo_venues()
-- ============================================================

-- ============================================================
-- 1. Schema changes
-- ============================================================

ALTER TABLE public.venues ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS city text;

-- ============================================================
-- 2. Public read policies: respect is_hidden, let is_demo bypass
--    the subscription gate that 005_owner_subscriptions.sql added
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view approved venues with active subscription" ON public.venues;
CREATE POLICY "Anyone can view approved venues with active subscription" ON public.venues FOR SELECT TO public
  USING (
    status = 'approved'
    AND is_hidden = false
    AND (is_demo = true OR public.owner_has_active_subscription(owner_id))
  );

DROP POLICY IF EXISTS "Anyone can view courts of approved venues with active subscription" ON public.courts;
CREATE POLICY "Anyone can view courts of approved venues with active subscription" ON public.courts FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id = courts.venue_id
      AND venues.status = 'approved'
      AND venues.is_hidden = false
      AND (venues.is_demo = true OR public.owner_has_active_subscription(venues.owner_id))
  ));

-- ============================================================
-- 3. Defense in depth: a demo court can never receive a real booking,
--    even if someone bypasses the app and calls Supabase directly
-- ============================================================

DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT TO public
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.courts c
      JOIN public.venues v ON v.id = c.venue_id
      WHERE c.id = bookings.court_id AND v.is_demo = true
    )
  );

-- ============================================================
-- 4. Auto-hide a demo venue once a real, subscribed owner adds a real
--    court for the same sport in the same city
-- ============================================================

CREATE OR REPLACE FUNCTION public.hide_matching_demo_venues()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_owner_id uuid;
  v_city text;
BEGIN
  SELECT owner_id, city INTO v_owner_id, v_city
  FROM public.venues WHERE id = NEW.venue_id AND is_demo = false;

  IF v_owner_id IS NULL OR v_city IS NULL OR NOT public.owner_has_active_subscription(v_owner_id) THEN
    RETURN NEW;
  END IF;

  UPDATE public.venues v
  SET is_hidden = true
  WHERE v.is_demo = true
    AND v.is_hidden = false
    AND v.city = v_city
    AND EXISTS (
      SELECT 1 FROM public.courts c
      WHERE c.venue_id = v.id AND c.sport_type = NEW.sport_type
    );

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_court_added_hide_demo ON public.courts;
CREATE TRIGGER on_court_added_hide_demo
  AFTER INSERT ON public.courts
  FOR EACH ROW EXECUTE FUNCTION public.hide_matching_demo_venues();

-- ============================================================
-- 5. Seed data: 9 demo venues (padel + football + tennis) across
--    Cairo / Alexandria / Mansoura. owner_id NULL, is_demo = true.
--    Re-running this file is safe — the block below is a no-op if
--    demo venues already exist.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.venues WHERE is_demo = true) THEN
    RETURN;
  END IF;

  -- Cairo — padel
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'ملعب النخبة بادل', 'التجمع الخامس، القاهرة الجديدة', 'القاهرة',
      'ملعب بادل بانورامي بإضاءة ليلية كاملة ومدرجات للمتفرجين، في قلب التجمع الخامس.',
      ARRAY['parking','cafeteria','wifi'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'الملعب الرئيسي', 'panoramic', 'padel', 180, ARRAY['/assets/imgs/demo/padel-1.jpg'] FROM new_venue;

  -- Cairo — football
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'ملعب الأبطال الرياضي', 'مدينة نصر، القاهرة', 'القاهرة',
      'ملعب خماسي عشب صناعي بمقاسات قانونية وإضاءة كشافات، مناسب لمباريات الشركات والأصدقاء.',
      ARRAY['parking','showers','lockers'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'الملعب الخماسي', 'outdoor', 'football', 300, ARRAY['/assets/imgs/demo/football-1.jpg'] FROM new_venue;

  -- Cairo — tennis
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'أكاديمية الملوك للتنس', 'المعادي، القاهرة', 'القاهرة',
      'كورت تنس خارجي بأرضية هارد كورت احترافية، هادئ ومناسب للتدريب والمباريات الودية.',
      ARRAY['parking','wifi'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'كورت رقم 1', 'outdoor', 'tennis', 150, ARRAY['/assets/imgs/demo/tennis-1.jpg'] FROM new_venue;

  -- Alexandria — padel
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'نادي بادل الشاطئ', 'سموحة، الإسكندرية', 'الإسكندرية',
      'ملعب بادل داخلي مكيف على مدار العام، على بعد دقائق من الكورنيش.',
      ARRAY['parking','cafeteria','showers'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'الملعب الرئيسي', 'indoor', 'padel', 170, ARRAY['/assets/imgs/demo/padel-1.jpg'] FROM new_venue;

  -- Alexandria — football
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'استاد المارينا الرياضي', 'سيدي جابر، الإسكندرية', 'الإسكندرية',
      'ملعب خماسي عشب صناعي إضاءة قوية، سهل الوصول وقريب من المواصلات العامة.',
      ARRAY['parking','lockers'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'الملعب الخماسي', 'outdoor', 'football', 280, ARRAY['/assets/imgs/demo/football-1.jpg'] FROM new_venue;

  -- Alexandria — tennis
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'نادي كورت الساحل', 'ميامي، الإسكندرية', 'الإسكندرية',
      'كورت تنس بإطلالة بحرية وأرضية هارد كورت، مثالي لتدريب الصباح والمساء.',
      ARRAY['parking','cafeteria'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'كورت رقم 1', 'outdoor', 'tennis', 140, ARRAY['/assets/imgs/demo/tennis-1.jpg'] FROM new_venue;

  -- Mansoura — padel
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'أكاديمية الصقر بادل', 'طريق المشاية، المنصورة الجديدة', 'المنصورة',
      'ملعب بادل مكشوف بمعايير دولية، ومقاعد مريحة للمتفرجين على جانبي الملعب.',
      ARRAY['parking','wifi','cafeteria'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'الملعب الرئيسي', 'outdoor', 'padel', 160, ARRAY['/assets/imgs/demo/padel-1.jpg'] FROM new_venue;

  -- Mansoura — football
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'ملعب النيل الرياضي', 'حي الجامعة، المنصورة', 'المنصورة',
      'صالة خماسي مغطاة بالكامل، تشتغل في أي جو وفي أي وقت من السنة.',
      ARRAY['parking','showers','lockers'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'الصالة المغطاة', 'indoor', 'football', 260, ARRAY['/assets/imgs/demo/football-1.jpg'] FROM new_venue;

  -- Mansoura — tennis
  WITH new_venue AS (
    INSERT INTO public.venues (owner_id, name, address, city, description, amenities, status, is_demo)
    VALUES (NULL, 'نادي فيرست تنس', 'شارع الجمهورية، المنصورة', 'المنصورة',
      'كورت تنس مغطى بإضاءة صناعية ثابتة، مناسب للعب في أي وقت من اليوم.',
      ARRAY['parking','wifi'], 'approved', true)
    RETURNING id
  )
  INSERT INTO public.courts (venue_id, name, type, sport_type, price_per_hour, images)
  SELECT id, 'كورت رقم 1', 'indoor', 'tennis', 130, ARRAY['/assets/imgs/demo/tennis-1.jpg'] FROM new_venue;
END $$;
