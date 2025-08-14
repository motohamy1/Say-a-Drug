import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Mic,
  Pill,
  Calculator,
  Heart,
  User,
  Menu
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  const navigation = [
    { name: t('nav.home'), href: "/", icon: Home },
    { name: t('nav.chat'), href: "/voice-assistant", icon: Mic },
    { name: t('nav.drugs'), href: "/drugs", icon: Pill },
    { name: t('nav.dosage'), href: "/dosage-calculator", icon: Calculator },
    { name: t('nav.personalCare'), href: "/personal-care", icon: Heart },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-sidebar-background border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-foreground">Say Drugs</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left transition-all duration-200",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                  !isActive && "hover:bg-primary hover:text-primary-foreground",
                  isCollapsed && "px-2 justify-center"
                )}
              >
                <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-border">
        <Link to="/profile">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left",
              isCollapsed && "px-2 justify-center"
            )}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <p className="text-sm font-medium text-sidebar-foreground">{t('user.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('user.info')}</p>
                </div>
              )}
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}