/*
  # Add attendance_record_id to attendance_logs

  The EmployeePortal inserts an attendance_record_id foreign key into attendance_logs
  to link each punch entry to its parent attendance record.

  ## Changes
  - Add nullable `attendance_record_id` column referencing attendance_records
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_logs' AND column_name = 'attendance_record_id'
  ) THEN
    ALTER TABLE attendance_logs
      ADD COLUMN attendance_record_id uuid REFERENCES attendance_records(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_logs_record ON attendance_logs(attendance_record_id);
