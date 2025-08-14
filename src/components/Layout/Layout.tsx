import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { language } = useLanguage();
  return (
    <div className="flex h-screen bg-background text-foreground" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-end gap-4 p-4">
          <LanguageToggle />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}