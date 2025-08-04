import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div
      onClick={toggleDarkMode}
      className="relative w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300"
      style={{ backgroundColor: isDarkMode ? '#000000' : '#ff3d00' }}
    >
      <div
        className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center"
        style={{ transform: isDarkMode ? 'translateX(28px)' : 'translateX(0)' }}
      >
        {isDarkMode ? (
          <Moon className="h-4 w-4 text-black" />
        ) : (
          <Sun className="h-4 w-4 text-orange-500" />
        )}
      </div>
    </div>
  );
}