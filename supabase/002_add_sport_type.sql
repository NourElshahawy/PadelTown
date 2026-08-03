-- Ace Town — adds sport_type to courts (Padel / Football / Tennis).
-- Run this in the Ace Town project's SQL Editor. schema.sql has already been
-- applied, so this is an ALTER, not part of the original CREATE TABLE.
--
-- `type` (regular/panoramic/indoor/outdoor) already exists and describes the
-- court's physical layout — sport_type is a separate, new axis: which sport
-- is played there. Existing courts default to 'padel' since that's all
-- Ace Town had until now.

ALTER TABLE public.courts
  ADD COLUMN sport_type text NOT NULL DEFAULT 'padel'
  CHECK (sport_type = ANY (ARRAY['padel'::text, 'football'::text, 'tennis'::text]));
