import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { CircleDot, CalendarCheck, BookHeart, Heart, Settings, ChevronRight } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";

const MENU_ITEMS = [
  { href: "/tasbih", icon: CircleDot, label: "Tasbih Counter", description: "Digital prayer beads" },
  { href: "/qada", icon: CalendarCheck, label: "Qada Tracker", description: "Track missed prayers" },
  { href: "/duas", icon: BookHeart, label: "Duas & Adhkar", description: "Daily supplications" },
  { href: "/favorites", icon: Heart, label: "Saved Verses", description: "Your favorite ayahs" },
];

export default function More() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [showLocationEdit, setShowLocationEdit] = useState(false);
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("");

  const city = settings?.city || "Mecca";
  const country = settings?.country || "Saudi Arabia";

  const openLocationEdit = () => {
    setEditCity(city);
    setEditCountry(country);
    setShowLocationEdit(true);
  };

  const handleSaveLocation = () => {
    if (editCity && editCountry) {
      updateSettings.mutate(
        { city: editCity, country: editCountry },
        {
          onSuccess: () => {
            setShowLocationEdit(false);
            setEditCity("");
            setEditCountry("");
          },
        }
      );
    }
  };

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
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
              {
                onSuccess: () => {
                  setShowLocationEdit(false);
                },
              }
            );
          } catch (e) {
            console.error("Geocoding failed", e);
          }
        },
        (err) => console.error("Geolocation error", err)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 md:px-8 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-serif text-center">More</h1>

      <div className="space-y-3">
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
            onClick={openLocationEdit}
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

      <Card className="bg-accent/30 border-white/50 p-4 rounded-2xl text-center">
        <p className="text-sm text-muted-foreground">
          Made with love for Muslim sisters everywhere
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Prayer times from Aladhan API
        </p>
      </Card>

      {showLocationEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => !updateSettings.isPending && setShowLocationEdit(false)}>
          <Card 
            className="w-full max-w-lg bg-background border-t border-white/50 rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg">Change Location</h3>
              <Button variant="ghost" size="icon" onClick={() => !updateSettings.isPending && setShowLocationEdit(false)} disabled={updateSettings.isPending}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <Input
                placeholder="City"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                data-testid="input-city"
              />
              <Input
                placeholder="Country"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                data-testid="input-country"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSaveLocation} 
                className="flex-1" 
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Location
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAutoDetect} 
                disabled={updateSettings.isPending}
              >
                <Navigation className="w-4 h-4 mr-2" /> Auto-detect
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
