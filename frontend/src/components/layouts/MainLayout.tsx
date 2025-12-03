import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Auto-collapse on mobile/tablet by default
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header with Gradient Accent */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 shadow-sm backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"></div>
            
            <SidebarTrigger className="hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg transition-colors p-2" />
            
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">BK</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                    BK POS System
                  </h1>
                </div>
              </div>
            </div>
            
            {/* Optional: Add current time/date */}
            <div className="hidden md:block text-sm text-slate-600 dark:text-slate-400 font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>
          
          <main className="flex-1 p-3 md:p-4 lg:p-4 xl:p-6 bg-slate-50 dark:bg-slate-950">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
