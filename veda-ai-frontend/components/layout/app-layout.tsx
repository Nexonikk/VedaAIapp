import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { MobileHeader } from "./mobile-header";
import { TopBar } from "./top-bar";

interface AppLayoutProps {
  children: React.ReactNode;
  mobileTitle?: string;
  showMobileSearch?: boolean;
}

export function AppLayout({
  children,
  mobileTitle,
  showMobileSearch,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Desktop Sidebar Container */}
      <div className="hidden lg:block fixed left-4 top-4 bottom-4 w-64 z-30">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <MobileHeader title={mobileTitle} showSearch={showMobileSearch} />

      {/* Main Content */}
      <main className="lg:pl-[18rem] pb-20 lg:pb-0 min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 px-4 lg:px-8 pb-8">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
