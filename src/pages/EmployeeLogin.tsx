import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, LogOut, Clock, CheckCircle } from "lucide-react";
import { useEmployees } from "@/hooks/supabase/useEmployees";
import { useClockIn, useClockOut, useActiveAttendance } from "@/hooks/supabase/useAttendance";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeLogin() {
  const [username, setUsername] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: employees = [] } = useEmployees();
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if employee already clocked in today
  const { data: activeAttendance } = useActiveAttendance(selectedEmployee?.id || "");

  const handleSearch = () => {
    setIsSearching(true);
    
    // Search by username
    const employee = employees.find(
      (e) => e.username?.toLowerCase() === username.toLowerCase()
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
        description: "Periksa kembali username Anda",
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
        title: "Absen Masuk Berhasil! ✓",
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

  const handleClockOut = async () => {
    if (!selectedEmployee || !activeAttendance) return;

    try {
      await clockOut.mutateAsync(activeAttendance.id);
      
      toast({
        title: "Absen Keluar Berhasil! ✓",
        description: `Terima kasih atas kerja keras Anda, ${selectedEmployee.name}!`,
      });

      // Redirect ke dashboard setelah 2 detik
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Clock out error:", error);
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
            Masukkan username untuk absen
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!selectedEmployee ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleSearch}
                disabled={!username || isSearching}
              >
                {isSearching ? "Mencari..." : "Cari Karyawan"}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Gunakan username yang terdaftar di sistem
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
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <p className="font-medium text-green-900">Anda sudah absen masuk hari ini</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Waktu masuk: {formatTime(activeAttendance.clock_in)}
                    </p>
                    {activeAttendance.clock_out && (
                      <p className="text-sm text-muted-foreground">
                        Waktu keluar: {formatTime(activeAttendance.clock_out)}
                      </p>
                    )}
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

                {activeAttendance && !activeAttendance.clock_out && (
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant="destructive"
                    onClick={handleClockOut}
                    disabled={clockOut.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {clockOut.isPending ? "Memproses..." : "Absen Keluar"}
                  </Button>
                )}

                {activeAttendance && activeAttendance.clock_out && (
                  <Alert className="border-blue-500 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <p className="text-sm text-blue-900 font-medium">
                        Anda sudah menyelesaikan absensi hari ini
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setUsername("");
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
