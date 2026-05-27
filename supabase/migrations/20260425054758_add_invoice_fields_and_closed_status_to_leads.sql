/*
  # Add Invoice Fields and Closed Status to Marketing Leads

  1. Changes to `marketing_leads`
     - `invoice_number` (text, optional) — invoice reference after conversion
     - `invoice_amount` (numeric, optional) — final invoice amount in INR
     - Adds 'closed' as a valid status (no constraint change needed, status is text)

  2. Notes
     - All existing rows are unaffected (new columns are nullable)
     - 'closed' status means deal is fully done/invoiced
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_leads' AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE marketing_leads ADD COLUMN invoice_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_leads' AND column_name = 'invoice_amount'
  ) THEN
    ALTER TABLE marketing_leads ADD COLUMN invoice_amount numeric(12,2);
  END IF;
END $$;
