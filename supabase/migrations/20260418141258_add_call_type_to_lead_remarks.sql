/*
  # Add call_type to lead_remarks

  ## Summary
  Adds a `call_type` column to the `lead_remarks` table to distinguish between different
  types of conversations:
  - 'telecaller_call'   : Telecaller discussing with client during a call
  - 'executive_visit'  : Executive visiting/meeting client in the field
  - 'manager_review'   : Manager reviewing / following up internally
  - 'general'          : General remark / update (default)

  This allows each portal to tag its conversation entries and the conversation
  timeline to show the correct context for every remark.

  ## Changes
  - `lead_remarks.call_type` (text, NOT NULL, DEFAULT 'general')
    Allowed values: 'telecaller_call', 'executive_visit', 'manager_review', 'general'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lead_remarks' AND column_name = 'call_type'
  ) THEN
    ALTER TABLE lead_remarks ADD COLUMN call_type text NOT NULL DEFAULT 'general';
  END IF;
END $$;
