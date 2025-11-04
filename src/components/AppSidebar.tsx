import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  UserCog,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin", "manager", "kasir"] },
  { title: "POS Kasir", url: "/pos", icon: ShoppingCart, roles: ["admin", "manager", "kasir"] },
  { title: "Inventori", url: "/inventory", icon: Package, roles: ["admin", "manager"] },
  { title: "Laporan", url: "/reports", icon: BarChart3, roles: ["admin", "manager", "kasir"] },
  { title: "Pelanggan", url: "/customers", icon: Users, roles: ["admin", "manager", "kasir"] },
  { title: "Karyawan", url: "/employees", icon: UserCog, roles: ["admin"] },
  { title: "Pengaturan", url: "/settings", icon: Settings, roles: ["admin", "manager"] },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [loginTime, setLoginTime] = useState("");
  const [userRole, setUserRole] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    const storedLoginTime = localStorage.getItem("loginTime");
    const storedRole = localStorage.getItem("userRole") || "kasir";
    const employeeId = localStorage.getItem("employeeId");
    
    setUsername(storedUsername);
    setUserRole(storedRole);
    
    // Fetch employee photo
    if (employeeId) {
      supabase
        .from('employees')
        .select('photo_url')
        .eq('id', employeeId)
        .single()
        .then(({ data }) => {
          if (data?.photo_url) {
            setPhotoUrl(data.photo_url);
          }
        });
    }
    
    if (storedLoginTime) {
      const time = new Date(storedLoginTime);
      setLoginTime(time.toLocaleTimeString("id-ID", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }));
    }
  }, []);

  const handleLogout = async () => {
    const employeeId = localStorage.getItem("employeeId");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("userRole");

    // Auto absensi keluar untuk kasir
    if (role === 'kasir' && employeeId) {
      try {
        // Get attendance record hari ini yang belum check out
        const today = new Date().toISOString().split('T')[0];

        const { data: attendances } = await supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('date', today)
          .is('check_out', null)
          .order('check_in', { ascending: false })
          .limit(1);

        if (attendances && attendances.length > 0) {
          // Update check_out
          await supabase
            .from('attendance')
            .update({ check_out: new Date().toISOString() })
            .eq('id', attendances[0].id);
        }
      } catch (error) {
        console.error('Error updating attendance:', error);
      }
    }

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("loginTime");
    
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    });
    
    navigate("/login");
  };

  // Filter menu berdasarkan role
  const filteredMenuItems = menuItems.filter((item) => {
    return item.roles.includes(userRole);
  });

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center">
            <img src="/Images/logo.png" alt="BasmiKuman POS Logo" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">BasmiKuman POS</h2>
            <p className="text-xs text-sidebar-foreground/80">Point of Sale System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90"
                          : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-3">
          {/* User Profile with Photo */}
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={photoUrl || undefined} />
              <AvatarFallback className="bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {username}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                {userRole === "admin" ? "Administrator" : userRole === "manager" ? "Manager" : "Kasir"} • {loginTime}
              </p>
            </div>
          </div>
          {/* Logout Button with Black Text */}
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-black hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
