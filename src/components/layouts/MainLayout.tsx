import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">POS System</h1>
            </div>
          </header>
          <main className="flex-1 p-3 md:p-4 lg:p-4 xl:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
