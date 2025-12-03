import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Actual table structure in production:
// id, employee_id, employee_username, employee_name, clock_in, clock_out, date, created_at, updated_at
export interface Attendance {
  id: string;
  employee_id: string;
  employee_username?: string | null;
  employee_name?: string | null;
  clock_in: string;
  clock_out: string | null;
  date?: string;
  created_at: string;
  updated_at: string;
  employees?: {
    id: string;
    name: string;
    position: string | null;
  };
}

export interface AttendanceSummary {
  employee_id: string;
  employee_name: string;
  position: string | null;
  total_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  avg_work_hours: number;
  last_attendance: string | null;
  // Alias untuk kompatibilitas
  present_count?: number;
  late_count?: number;
  absent_count?: number;
  attendance_percentage?: number;
}

// Get all attendance records
export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employees (
            id,
            name,
            position
          )
        `)
        .order('clock_in', { ascending: false });

      if (error) throw error;
      return data as Attendance[];
    },
  });
}

// Get attendance by employee
export function useEmployeeAttendance(employeeId: string) {
  return useQuery({
    queryKey: ['attendance', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .order('clock_in', { ascending: false });

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!employeeId,
  });
}

// Get today's attendance
export function useTodayAttendance() {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employees (
            id,
            name,
            position
          )
        `)
        .gte('clock_in', `${today}T00:00:00`)
        .lte('clock_in', `${today}T23:59:59`)
        .order('clock_in', { ascending: false });

      if (error) throw error;
      return data as Attendance[];
    },
  });
}

// Get attendance summary
export function useAttendanceSummary() {
  return useQuery({
    queryKey: ['attendance', 'summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_summary')
        .select('*')
        .order('employee_name');

      // If view doesn't exist, return empty array instead of throwing
      if (error) {
        console.warn('Attendance summary view not available:', error.message);
        return [] as AttendanceSummary[];
      }
      return data as AttendanceSummary[];
    },
    // Don't retry if view doesn't exist
    retry: false,
  });
}

// Clock in (create attendance)
export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          employee_id: employeeId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Clock In Berhasil",
        description: "Selamat bekerja!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Clock In Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Clock out (update attendance)
export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const { data, error } = await supabase
        .from('attendance')
        .update({
          clock_out: new Date().toISOString(),
        })
        .eq('id', attendanceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Clock Out Berhasil",
        description: "Terima kasih atas kerja keras Anda!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Clock Out Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Get active attendance (belum clock out) untuk employee tertentu
export function useActiveAttendance(employeeId: string) {
  return useQuery({
    queryKey: ['attendance', 'active', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Attendance | null;
    },
    enabled: !!employeeId,
  });
}

// Update attendance notes
// Note: This function is disabled because the production table doesn't have 'notes' column
export function useUpdateAttendanceNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      // Notes column doesn't exist in production table
      console.warn('Notes column not available in attendance table');
      throw new Error('Notes feature is not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Catatan Disimpan",
        description: "Catatan absensi berhasil diupdate",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal Update",
        description: error.message || 'Fitur catatan tidak tersedia',
        variant: "destructive",
      });
    },
  });
}
