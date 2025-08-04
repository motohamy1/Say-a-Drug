import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto relative p-4">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}