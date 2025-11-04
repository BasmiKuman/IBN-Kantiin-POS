-- =====================================================
-- ATTENDANCE SYSTEM SCHEMA
-- System absensi otomatis saat login karyawan
-- =====================================================

-- Tabel Attendance (Absensi)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ,
  work_duration INTEGER, -- dalam menit
  status TEXT DEFAULT 'present', -- present, late, half_day, absent
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON public.attendance;
CREATE POLICY "Authenticated users can view attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create attendance" ON public.attendance;
CREATE POLICY "Authenticated users can create attendance"
  ON public.attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update attendance" ON public.attendance;
CREATE POLICY "Authenticated users can update attendance"
  ON public.attendance FOR UPDATE
  TO authenticated
  USING (true);

-- Indexes
DROP INDEX IF EXISTS idx_attendance_employee;
CREATE INDEX idx_attendance_employee ON public.attendance(employee_id);

DROP INDEX IF EXISTS idx_attendance_date;
CREATE INDEX idx_attendance_date ON public.attendance(clock_in);

DROP INDEX IF EXISTS idx_attendance_status;
CREATE INDEX idx_attendance_status ON public.attendance(status);

-- Trigger untuk updated_at
DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function untuk auto clock out (jika lupa)
CREATE OR REPLACE FUNCTION auto_clock_out_previous_attendance()
RETURNS TRIGGER AS $$
BEGIN
  -- Clock out absensi sebelumnya yang belum di-clock out
  UPDATE public.attendance
  SET 
    clock_out = NEW.clock_in,
    work_duration = EXTRACT(EPOCH FROM (NEW.clock_in - clock_in))/60,
    updated_at = NOW()
  WHERE 
    employee_id = NEW.employee_id 
    AND clock_out IS NULL 
    AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_clock_out ON public.attendance;
CREATE TRIGGER trigger_auto_clock_out
  BEFORE INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION auto_clock_out_previous_attendance();

-- Function untuk calculate work duration saat clock out
CREATE OR REPLACE FUNCTION calculate_work_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL AND OLD.clock_out IS NULL THEN
    NEW.work_duration := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in))/60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_duration ON public.attendance;
CREATE TRIGGER trigger_calculate_duration
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION calculate_work_duration();

-- Function untuk menentukan status (terlambat jika clock in > 08:30)
CREATE OR REPLACE FUNCTION determine_attendance_status()
RETURNS TRIGGER AS $$
DECLARE
  clock_in_time TIME;
  late_threshold TIME := '08:30:00';
BEGIN
  clock_in_time := NEW.clock_in::TIME;
  
  IF clock_in_time > late_threshold THEN
    NEW.status := 'late';
  ELSE
    NEW.status := 'present';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_determine_status ON public.attendance;
CREATE TRIGGER trigger_determine_status
  BEFORE INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION determine_attendance_status();

-- View untuk attendance summary per employee
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
  e.id as employee_id,
  e.name as employee_name,
  e.position,
  COUNT(a.id) as total_days,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
  COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
  COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
  ROUND(AVG(a.work_duration)::numeric, 2) as avg_work_hours,
  MAX(a.clock_in) as last_attendance
FROM public.employees e
LEFT JOIN public.attendance a ON e.id = a.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.name, e.position;

-- Grant access to view
GRANT SELECT ON attendance_summary TO authenticated;

COMMENT ON TABLE public.attendance IS 'Tabel absensi karyawan - otomatis tercatat saat login';
COMMENT ON COLUMN public.attendance.clock_in IS 'Waktu masuk/login';
COMMENT ON COLUMN public.attendance.clock_out IS 'Waktu keluar/logout';
COMMENT ON COLUMN public.attendance.work_duration IS 'Durasi kerja dalam menit';
COMMENT ON COLUMN public.attendance.status IS 'present=tepat waktu, late=terlambat, half_day=setengah hari, absent=tidak masuk';
