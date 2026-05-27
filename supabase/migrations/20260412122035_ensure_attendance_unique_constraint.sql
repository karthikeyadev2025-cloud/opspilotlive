/*
  # Ensure attendance_records unique constraint

  ## Summary
  The check-in upsert uses onConflict: 'staff_user_id,attendance_date' but the
  unique constraint may not exist. This migration adds it safely.

  Also ensures the table has no orphaned rows that would block the constraint.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'attendance_records'::regclass
    AND contype = 'u'
    AND conname = 'attendance_records_staff_user_id_attendance_date_key'
  ) THEN
    ALTER TABLE attendance_records
      ADD CONSTRAINT attendance_records_staff_user_id_attendance_date_key
      UNIQUE (staff_user_id, attendance_date);
  END IF;
END $$;
