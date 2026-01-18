import { Link, useLocation } from "wouter";
import { BookOpen, Heart, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/quran", icon: BookOpen, label: "Quran" },
    { href: "/favorites", icon: Heart, label: "Favorites" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-primary/10 pb-safe z-50">
      <div className="flex justify-around items-center p-3">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
              isActive 
                ? "text-primary scale-110" 
                : "text-muted-foreground hover:text-primary/70"
            )}>
              <item.icon className={cn("w-6 h-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
