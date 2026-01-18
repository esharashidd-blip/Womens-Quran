import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { BookHeart, Heart, Settings, ChevronRight, Loader2, MapPin, Navigation, X, BookOpen, Plane, LogOut } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";

const POPULAR_LOCATIONS = [
  { city: "Mecca", country: "Saudi Arabia" },
  { city: "Medina", country: "Saudi Arabia" },
  { city: "London", country: "United Kingdom" },
  { city: "New York", country: "United States" },
  { city: "Dubai", country: "United Arab Emirates" },
  { city: "Cairo", country: "Egypt" },
  { city: "Istanbul", country: "Turkey" },
  { city: "Jakarta", country: "Indonesia" },
  { city: "Kuala Lumpur", country: "Malaysia" },
  { city: "Toronto", country: "Canada" },
  { city: "Sydney", country: "Australia" },
  { city: "Paris", country: "France" },
];

const MENU_ITEMS = [
  { href: "/duas", icon: BookHeart, label: "Duas & Adhkar", description: "Daily supplications" },
  { href: "/favorites", icon: Heart, label: "Saved Verses", description: "Your favorite ayahs" },
  { href: "/umrah", icon: Plane, label: "Umrah Guide", description: "Step-by-step guide" },
  { href: "/hajj", icon: BookOpen, label: "Hajj Guide", description: "Pilgrimage essentials" },
];

export default function More() {
  const { data: settings, isLoading } = useSettings();
  const { user } = useAuth();
  const updateSettings = useUpdateSettings();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const city = settings?.city || "Mecca";
  const country = settings?.country || "Saudi Arabia";

  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return POPULAR_LOCATIONS;
    const query = locationSearch.toLowerCase();
    return POPULAR_LOCATIONS.filter(loc => 
      loc.city.toLowerCase().includes(query) || 
      loc.country.toLowerCase().includes(query)
    );
  }, [locationSearch]);

  const handleSelectLocation = (loc: { city: string; country: string }) => {
    updateSettings.mutate(
      { city: loc.city, country: loc.country },
      { onSuccess: () => {
        setShowLocationPicker(false);
        setLocationSearch("");
      }}
    );
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          );
          const data = await res.json();
          updateSettings.mutate(
            {
              city: data.city || data.locality || "Unknown",
              country: data.countryName || "Unknown",
              autoLocation: true,
            },
            { onSuccess: () => {
              setShowLocationPicker(false);
              setLocationSearch("");
              setIsDetecting(false);
            }}
          );
        } catch (e) {
          console.error("Geocoding failed", e);
          setIsDetecting(false);
        }
      },
      (err) => {
        console.error("Geolocation error", err);
        setIsDetecting(false);
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-serif text-center">More</h1>

      <div className="space-y-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer" data-testid={`link-${item.href.slice(1)}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="bg-white/80 border-white/50 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Settings</p>
            <p className="text-xs text-muted-foreground">Location & preferences</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-primary/10">
          <button
            onClick={() => setShowLocationPicker(true)}
            className="flex items-center justify-between w-full text-left"
            data-testid="button-change-location"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{city}, {country}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </Card>

      {user && (
        <a href="/api/logout">
          <Card className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer" data-testid="button-logout">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Sign Out</p>
                <p className="text-xs text-muted-foreground">Signed in as {user.email || user.firstName}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </a>
      )}

      <Card className="bg-accent/30 border-white/50 p-4 rounded-2xl text-center">
        <p className="text-sm text-muted-foreground">
          Made with love for Muslim sisters everywhere
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Prayer times from Aladhan API
        </p>
      </Card>

      {showLocationPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => !updateSettings.isPending && setShowLocationPicker(false)}>
          <Card 
            className="w-full max-w-lg bg-background border-t border-white/50 rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg">Select Location</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowLocationPicker(false)} disabled={updateSettings.isPending}>
                Done
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search city or country..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl"
                data-testid="input-location-search"
              />
            </div>

            <Button 
              variant="outline" 
              onClick={handleAutoDetect} 
              disabled={updateSettings.isPending || isDetecting}
              className="w-full h-11 rounded-xl gap-2"
              data-testid="button-auto-detect"
            >
              {isDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              Use My Current Location
            </Button>

            <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
              {filteredLocations.map((loc, index) => {
                const isSelected = loc.city === city && loc.country === country;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(loc)}
                    disabled={updateSettings.isPending}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'
                    }`}
                    data-testid={`location-${loc.city.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{loc.city}</p>
                        <p className="text-xs text-muted-foreground">{loc.country}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
