/*
  # Add not_answered status to marketing_leads

  ## Changes
  - Adds 'not_answered' as a valid status value for marketing_leads status column
  - Updates the check constraint to include the new status

  ## Notes
  - Safe migration: only extends the allowed values, does not remove or change existing data
*/

DO $$
BEGIN
  ALTER TABLE marketing_leads DROP CONSTRAINT IF EXISTS marketing_leads_status_check;
  ALTER TABLE marketing_leads ADD CONSTRAINT marketing_leads_status_check
    CHECK (status IN ('new', 'called', 'interested', 'not_interested', 'not_answered', 'converted', 'callback'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
