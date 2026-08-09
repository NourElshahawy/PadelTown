-- Run these THREE queries against PadelGo (PadelTown)'s Supabase SQL Editor,
-- one at a time. Each returns a single text blob — copy the result and paste
-- it back. This pulls RLS policies + function bodies via Postgres' system
-- catalogs, so it works even without a direct DB connection.

-- ============================================================
-- Query A — all public-schema RLS policies as ready-to-run CREATE POLICY
-- ============================================================
select string_agg(
  format(
    'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s%s%s;',
    policyname, schemaname, tablename,
    permissive,
    cmd,
    array_to_string(roles, ', '),
    case when qual is not null then format(E'\n  USING (%s)', qual) else '' end,
    case when with_check is not null then format(E'\n  WITH CHECK (%s)', with_check) else '' end
  ), E'\n\n' order by tablename, policyname
) as rls_policies_sql
from pg_policies
where schemaname = 'public';

-- ============================================================
-- Query B — the two RPC functions the app calls (email_exists, get_court_booking_count)
-- ============================================================
select string_agg(pg_get_functiondef(p.oid) || ';', E'\n\n' order by p.proname) as functions_sql
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('email_exists', 'get_court_booking_count');

-- ============================================================
-- Query C — storage buckets config + their RLS policies
-- ============================================================
select
  (select string_agg(
    format(
      'insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values (%L, %L, %L, %L, %L);',
      id, name, public, file_size_limit, allowed_mime_types
    ), E'\n' order by id
  ) from storage.buckets)
  || E'\n\n' ||
  (select string_agg(
    format(
      'CREATE POLICY %I ON storage.objects AS %s FOR %s TO %s%s%s;',
      policyname, permissive, cmd, array_to_string(roles, ', '),
      case when qual is not null then format(E'\n  USING (%s)', qual) else '' end,
      case when with_check is not null then format(E'\n  WITH CHECK (%s)', with_check) else '' end
    ), E'\n\n' order by policyname
  ) from pg_policies where schemaname = 'storage' and tablename = 'objects')
as storage_setup_sql;
