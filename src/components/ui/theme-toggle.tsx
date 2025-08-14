import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button variant="outline" size="sm" onClick={toggleDarkMode}>
      {isDarkMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}