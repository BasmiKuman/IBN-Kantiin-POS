import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Receipt,
  Users,
  UserCog,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin", "manager", "kasir"] },
  { title: "POS Kasir", url: "/pos", icon: ShoppingCart, roles: ["admin", "manager", "kasir"] },
  { title: "Inventori", url: "/inventory", icon: Package, roles: ["admin", "manager"] },
  { title: "Laporan", url: "/reports", icon: BarChart3, roles: ["admin", "manager", "kasir"] },
  { title: "History Transaksi", url: "/history", icon: Receipt, roles: ["admin", "manager", "kasir"] },
  { title: "Pelanggan", url: "/customers", icon: Users, roles: ["admin", "manager", "kasir"] },
  { title: "Karyawan", url: "/employees", icon: UserCog, roles: ["admin"] },
  { title: "Pengaturan", url: "/settings", icon: Settings, roles: ["admin", "manager"] },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { open, toggleSidebar } = useSidebar();
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
          .is('clock_out', null)
          .order('clock_in', { ascending: false })
          .limit(1);

        if (attendances && attendances.length > 0) {
          // Update clock_out
          await supabase
            .from('attendance')
            .update({ clock_out: new Date().toISOString() })
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
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen shadow-lg">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 shadow-lg">
            <img src="/Images/logo.png" alt="BK POS Logo" className="h-6 w-6 object-contain" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">BK POS</h2>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">Point of Sale System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2 group-data-[collapsible=icon]:hidden">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <TooltipProvider delayDuration={0}>
                {filteredMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end
                            onClick={(e) => {
                              // Auto-close sidebar on mobile when clicking active link
                              const isActive = window.location.pathname === item.url;
                              if (isActive && window.innerWidth < 1024) {
                                toggleSidebar();
                              }
                            }}
                            className={({ isActive }) =>
                              isActive
                                ? "flex items-center gap-3 px-4 py-3.5 rounded-xl bg-violet-600 dark:bg-violet-700 text-white font-bold border-2 border-violet-700 dark:border-violet-600 shadow-lg shadow-violet-500/50 dark:shadow-violet-900/50 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3"
                                : "flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3"
                            }
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="group-data-[state=expanded]:hidden bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50">
        <div className="space-y-3">
          {/* Collapse/Expand Button - Fixed Color */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-start gap-2 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors text-sm h-9 font-medium"
          >
            {open ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Tutup Sidebar</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                <span>Buka Sidebar</span>
              </>
            )}
          </Button>
          
          <Separator className="bg-slate-200 dark:bg-slate-700" />
          
          {/* User Profile with Photo */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-850 border border-slate-200 dark:border-slate-700">
            <Avatar className="h-9 w-9 border-2 border-violet-400 dark:border-violet-600 flex-shrink-0 shadow-sm">
              <AvatarImage src={photoUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 dark:from-violet-600 dark:to-purple-700">
                <User className="h-4 w-4 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {username}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {userRole === "admin" ? "Admin" : userRole === "manager" ? "Manager" : "Kasir"} • {loginTime}
              </p>
            </div>
          </div>
          {/* Logout Button */}
          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-start gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-700 transition-colors text-sm h-9 font-medium border-slate-300 dark:border-slate-700" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
