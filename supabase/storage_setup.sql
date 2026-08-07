-- InstaPadel — storage buckets + policies, ported from PadelGo.
-- Run this in the InstaPadel project's Supabase SQL Editor, after schema.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('avatars', 'avatars', true, NULL, NULL);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('payment-proofs', 'payment-proofs', true, NULL, NULL);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('venue-photos', 'venue-photos', true, NULL, NULL);

CREATE POLICY "Anyone can view avatars" ON storage.objects AS PERMISSIVE FOR SELECT TO public
  USING ((bucket_id = 'avatars'::text));

CREATE POLICY "Anyone can view payment proofs" ON storage.objects AS PERMISSIVE FOR SELECT TO public
  USING ((bucket_id = 'payment-proofs'::text));

CREATE POLICY "Anyone can view venue photos" ON storage.objects AS PERMISSIVE FOR SELECT TO public
  USING ((bucket_id = 'venue-photos'::text));

CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((bucket_id = 'payment-proofs'::text));

CREATE POLICY "Authenticated users can upload venue photos" ON storage.objects AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (((bucket_id = 'venue-photos'::text) AND (auth.uid() IS NOT NULL)));

CREATE POLICY "Users can upload own avatar" ON storage.objects AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.uid() IS NOT NULL)));
