import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

export function FeatureCard({ title, description, icon: Icon, href, className }: FeatureCardProps) {
  return (
    <Link to={href}>
      <Card className={cn(
        "w-48 h-48 rounded-full flex flex-col items-center justify-center text-center p-4",
        "hover:shadow-lg transition-all duration-300 cursor-pointer group",
        className
      )}>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-base mb-1">{title}</h3>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}