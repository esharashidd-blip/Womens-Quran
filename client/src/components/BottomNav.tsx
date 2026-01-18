import { Link, useLocation } from "wouter";
import { Home, Clock, Heart, BookOpen, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/prayer", icon: Clock, label: "Prayer" },
    { href: "/foryou", icon: Heart, label: "For You", special: true },
    { href: "/quran", icon: BookOpen, label: "Quran" },
    { href: "/more", icon: Menu, label: "More" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-primary/10 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <button
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-200",
                  isActive 
                    ? "text-primary scale-105" 
                    : "text-muted-foreground hover:text-primary/70"
                )}
              >
                {item.special ? (
                  <div className="relative">
                    <item.icon className={cn("w-5 h-5", isActive && "fill-primary/30")} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                ) : (
                  <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                )}
                <span className={cn("text-[10px] font-medium", item.special && "flex items-center gap-0.5")}>
                  {item.label}{item.special && " 🤍"}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
