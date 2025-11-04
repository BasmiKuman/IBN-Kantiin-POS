import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, User, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Query employees table untuk validasi login
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      if (error || !employee) {
        toast({
          title: "Login Gagal",
          description: "Username atau password salah",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Set login status di localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", employee.name);
      localStorage.setItem("userRole", employee.position);
      localStorage.setItem("employeeId", employee.id);
      localStorage.setItem("loginTime", new Date().toISOString());

      // Auto absensi masuk untuk kasir
      if (employee.position === 'kasir') {
        const { error: attendanceError } = await supabase
          .from('attendance')
          .insert({
            employee_id: employee.id,
            employee_username: employee.username,
            employee_name: employee.name,
            clock_in: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
          });

        if (attendanceError) {
          console.error('Error creating attendance:', attendanceError);
        }
      }

      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${employee.name}! (${employee.position})`,
      });

      navigate("/");
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center text-center space-y-6 p-8">
          <div className="bg-white rounded-full p-8 shadow-2xl">
            <img src="/Images/logo.png" alt="BasmiKuman POS Logo" className="h-32 w-32 object-contain" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white">
              BasmiKuman POS
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Sistem Point of Sale Modern
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Kelola bisnis Anda dengan mudah dan efisien
            </p>
          </div>
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Cloud-based</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Secure</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4 md:hidden">
              <div className="bg-white rounded-full p-4">
                <img src="/Images/logo.png" alt="BasmiKuman POS Logo" className="h-16 w-16 object-contain" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Login POS</CardTitle>
            <CardDescription className="text-center">
              Masukkan kredensial Anda untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Login"}
              </Button>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/employee-login")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Login Karyawan (Absensi)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
