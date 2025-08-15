import { Sidebar } from "./Sidebar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen bg-background text-foreground" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <header className={`flex items-center justify-between p-4`}>
          <div></div> {/* This empty div will push the other elements to the right */}
          <div className="flex items-center gap-4">
            <LanguageToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}