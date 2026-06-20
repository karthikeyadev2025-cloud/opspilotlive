/*
  # Drop dead Aadya marketing-site content tables

  ## Why
  PublicSite.tsx (the old Aadya solar/CCTV public marketing site) was never
  routed in App.tsx — confirmed dead code, now deleted from src/. Every table
  below existed only to feed that unrouted page or its admin content
  managers (also deleted). Zero remaining readers/writers in the codebase
  (verified via grep across src/ before writing this migration).

  lead_activities was defined but never queried anywhere — also dead.

  This does NOT touch any OpsPilot product table (app_users, marketing_leads,
  attendance_records, tenants, etc.) — only the legacy single-company
  marketing site's content tables.
*/

DROP TABLE IF EXISTS career_applications CASCADE;
DROP TABLE IF EXISTS investment_inquiries CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS solar_types CASCADE;
DROP TABLE IF EXISTS solar_benefits CASCADE;
DROP TABLE IF EXISTS solar_best_practices CASCADE;
DROP TABLE IF EXISTS cctv_brands CASCADE;
DROP TABLE IF EXISTS cctv_packages CASCADE;
DROP TABLE IF EXISTS company_benefits CASCADE;
DROP TABLE IF EXISTS managing_director CASCADE;
DROP TABLE IF EXISTS why_choose_us CASCADE;
DROP TABLE IF EXISTS lead_activities CASCADE;
