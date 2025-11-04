import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Clock, CheckCircle } from "lucide-react";
import { useEmployees } from "@/hooks/supabase/useEmployees";
import { useClockIn, useActiveAttendance } from "@/hooks/supabase/useAttendance";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeLogin() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: employees = [] } = useEmployees();
  const clockIn = useClockIn();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if employee already clocked in today
  const { data: activeAttendance } = useActiveAttendance(selectedEmployee?.id || "");

  const handleSearch = () => {
    setIsSearching(true);
    
    // Search by phone or email
    const employee = employees.find(
      (e) => 
        e.phone === employeeCode || 
        e.email === employeeCode ||
        e.id === employeeCode
    );

    if (employee) {
      if (!employee.is_active) {
        toast({
          title: "Karyawan Tidak Aktif",
          description: "Akun karyawan ini sudah tidak aktif",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }
      setSelectedEmployee(employee);
    } else {
      toast({
        title: "Karyawan Tidak Ditemukan",
        description: "Periksa kembali nomor telepon atau email Anda",
        variant: "destructive",
      });
    }
    setIsSearching(false);
  };

  const handleClockIn = async () => {
    if (!selectedEmployee) return;

    try {
      await clockIn.mutateAsync(selectedEmployee.id);
      
      toast({
        title: "Absensi Berhasil! ✓",
        description: `Selamat bekerja, ${selectedEmployee.name}!`,
      });

      // Redirect ke dashboard setelah 2 detik
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Clock in error:", error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Absensi Karyawan</CardTitle>
          <CardDescription>
            Masukkan nomor telepon atau email untuk absen
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!selectedEmployee ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="employeeCode">Nomor Telepon / Email</Label>
                <Input
                  id="employeeCode"
                  placeholder="08123456789 atau email@example.com"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  autoFocus
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleSearch}
                disabled={!employeeCode || isSearching}
              >
                {isSearching ? "Mencari..." : "Cari Karyawan"}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Gunakan nomor telepon atau email yang terdaftar di sistem
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Employee Info */}
              <Alert className="border-primary/20 bg-primary/5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold text-base">{selectedEmployee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmployee.position || "Karyawan"}
                    </p>
                    {selectedEmployee.phone && (
                      <p className="text-xs text-muted-foreground">{selectedEmployee.phone}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Already Clocked In Warning */}
              {activeAttendance && (
                <Alert className="border-warning bg-warning/5">
                  <Clock className="h-4 w-4 text-warning" />
                  <AlertDescription>
                    <p className="font-medium">Anda sudah absen masuk hari ini</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Waktu masuk: {formatTime(activeAttendance.clock_in)}
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Current Time */}
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Waktu Sekarang</p>
                <p className="text-3xl font-bold text-primary">
                  {new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!activeAttendance && (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleClockIn}
                    disabled={clockIn.isPending}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {clockIn.isPending ? "Memproses..." : "Absen Masuk"}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setEmployeeCode("");
                  }}
                >
                  Ganti Karyawan
                </Button>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Keterlambatan dihitung jika absen masuk setelah jam 08:30
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
