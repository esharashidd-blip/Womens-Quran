import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Heart, Settings, ChevronRight, Loader2, MapPin, Navigation, BookOpen, Plane, LogOut, Bell, Moon, Flower2, MessageCircle, User, Edit2, Shirt, HandHeart } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

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
  { href: "/favorites", icon: Heart, label: "Saved Verses", description: "Your favorite ayahs" },
  { href: "/kalimas", icon: Flower2, label: "Six Kalmas", description: "The six foundational declarations" },
  { href: "/duas", icon: HandHeart, label: "Duas & Adhkar", description: "Daily supplications & remembrances" },
  { href: "/coach", icon: MessageCircle, label: "Speak to an Islamic Coach", description: "Faith-based guidance for sisters" },
  { href: "/umrah", icon: Plane, label: "Umrah Guide", description: "Step-by-step rituals & duas" },
  { href: "/hajj", icon: BookOpen, label: "Hajj Guide", description: "Comprehensive pilgrimage guide" },
  { id: "clothing", icon: Shirt, label: "Islamic Clothing", description: "Modest wear for sisters", comingSoon: true },
];

export default function More() {
  const { data: settings, isLoading } = useSettings();
  const { user, logout, updateDisplayName } = useAuth();
  const updateSettings = useUpdateSettings();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [showCycleModeModal, setShowCycleModeModal] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [showClothingComingSoon, setShowClothingComingSoon] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const city = settings?.city || "Mecca";
  const country = settings?.country || "Saudi Arabia";

  // Check if we're in a WKWebView (iOS app wrapper)
  const isWKWebView = () => {
    const ua = navigator.userAgent;
    return ua.includes('iPhone') && !ua.includes('Safari/');
  };

  // Check if notifications are supported
  const notificationsSupported = "Notification" in window && !isWKWebView();

  // Geolocation is available (native bridge provides it in iOS app)
  const canUseGeolocation = 'geolocation' in navigator;

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
      {
        onSuccess: () => {
          setShowLocationPicker(false);
          setLocationSearch("");
        }
      }
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
            {
              onSuccess: () => {
                setShowLocationPicker(false);
                setLocationSearch("");
                setIsDetecting(false);
              }
            }
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
          const content = (
            <Card className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer" data-testid={item.href ? `link-${item.href.slice(1)}` : `link-${item.id}`}>
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
          );

          if (item.comingSoon) {
            return (
              <div key={item.id} onClick={() => setShowClothingComingSoon(true)}>
                {content}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href!}>
              {content}
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

        <div className="mt-4 pt-4 border-t border-primary/10 space-y-3">
          {/* Name Setting */}
          <button
            onClick={() => {
              setNameInput(user?.firstName || "");
              setShowNameEditor(true);
            }}
            className="flex items-center justify-between w-full text-left"
            data-testid="button-change-name"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user?.firstName || "Set your name"}</span>
            </div>
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </button>

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

          {notificationsSupported && (
            <button
              onClick={async () => {
                const newValue = !settings?.prayerNotifications;
                if (newValue && Notification.permission !== "granted") {
                  try {
                    const permission = await Notification.requestPermission();
                    if (permission !== "granted") {
                      return; // Don't enable if permission not granted
                    }
                  } catch (e) {
                    console.log("Notification permission error:", e);
                    return;
                  }
                }
                updateSettings.mutate({ prayerNotifications: newValue });
              }}
              className="flex items-center justify-between w-full text-left"
              data-testid="button-toggle-notifications"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Prayer Notifications</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${settings?.prayerNotifications ? 'bg-primary' : 'bg-muted'} flex items-center px-0.5`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings?.prayerNotifications ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          )}

          <button
            onClick={() => updateSettings.mutate({ ramadanMode: !settings?.ramadanMode })}
            className="flex items-center justify-between w-full text-left"
            data-testid="button-toggle-ramadan"
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Ramadan Mode</span>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${settings?.ramadanMode ? 'bg-emerald-500' : 'bg-muted'} flex items-center px-0.5`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings?.ramadanMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>
      </Card>

      {/* Mode Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-serif px-2">Mode</h2>
        <Card className="bg-white/80 border-primary/5 p-4 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings?.cycleMode ? 'bg-purple-100' : 'bg-primary/10'}`}>
              <Moon className={`w-5 h-5 ${settings?.cycleMode ? 'text-purple-600' : 'text-primary'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium">🌙 Cycle Mode</p>
              <p className="text-xs text-muted-foreground">A gentler way to stay connected during your cycle</p>
            </div>
            <div
              onClick={() => {
                const newValue = !settings?.cycleMode;
                if (newValue && settings?.cycleModeFirstTime) {
                  setShowCycleModeModal(true);
                  updateSettings.mutate({ cycleMode: true, cycleModeFirstTime: false });
                } else {
                  updateSettings.mutate({ cycleMode: newValue });
                }

              }}
              className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${settings?.cycleMode ? 'bg-purple-500' : 'bg-muted'} flex items-center px-1 shadow-inner`}
              data-testid="button-toggle-cycle-mode"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${settings?.cycleMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          {settings?.cycleMode && (
            <div className="mt-4 pt-4 border-t border-purple-100 flex items-start gap-3 animate-in fade-in slide-in-from-top duration-500">
              <span className="text-xl">✨</span>
              <p className="text-xs text-purple-700 italic font-serif leading-relaxed">
                "Allah knows your body better than you do. Resting is not falling behind."
              </p>
            </div>
          )}
        </Card>
      </div>

      {user && (
        <Card
          className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer"
          data-testid="button-logout"
          onClick={() => logout()}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Sign Out</p>
              <p className="text-xs text-muted-foreground">Signed in as {user.email}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
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

            {canUseGeolocation && (
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
            )}

            <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
              {filteredLocations.map((loc, index) => {
                const isSelected = loc.city === city && loc.country === country;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(loc)}
                    disabled={updateSettings.isPending}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'
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

      {/* Name Editor Modal */}
      {showNameEditor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setShowNameEditor(false)}>
          <Card
            className="w-full max-w-sm bg-background rounded-3xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-center">What should we call you?</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your name will appear in the app greeting.
            </p>
            <Input
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="h-12 rounded-xl text-center text-lg"
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && !isSavingName) {
                  const firstName = nameInput.trim().split(/\s+/)[0];
                  if (firstName) {
                    setIsSavingName(true);
                    try {
                      await updateDisplayName(firstName);
                    } catch (err) {
                      console.error("Failed to save name:", err);
                    }
                    setIsSavingName(false);
                  }
                  setShowNameEditor(false);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setShowNameEditor(false)}
                disabled={isSavingName}
              >
                Cancel
              </Button>
              <Button
                className="w-full rounded-xl"
                disabled={isSavingName}
                onClick={async () => {
                  const firstName = nameInput.trim().split(/\s+/)[0];
                  if (firstName) {
                    setIsSavingName(true);
                    try {
                      await updateDisplayName(firstName);
                    } catch (err) {
                      console.error("Failed to save name:", err);
                    }
                    setIsSavingName(false);
                  }
                  setShowNameEditor(false);
                }}
              >
                {isSavingName ? "Saving..." : "Save"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Cycle Mode First-Time Modal */}
      <Dialog open={showCycleModeModal} onOpenChange={setShowCycleModeModal}>
        <DialogContent className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 max-w-sm mx-auto rounded-3xl">
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🌸</div>
            <h2 className="text-xl font-serif text-purple-900 mb-4">
              Cycle Mode Activated
            </h2>
            <p className="font-serif text-lg text-purple-800 mb-2">
              "Allah knows your body better than you do."
            </p>
            <p className="font-serif text-purple-600 italic">
              Resting is not falling behind.
            </p>
            <Button
              onClick={() => setShowCycleModeModal(false)}
              className="mt-6 bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8"
            >
              I understand 💕
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Islamic Clothing Coming Soon Modal */}
      <Dialog open={showClothingComingSoon} onOpenChange={setShowClothingComingSoon}>
        <DialogContent className="bg-white border-primary/10 max-w-sm mx-auto rounded-3xl">
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shirt className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-serif text-primary-dark mb-3">
              Islamic Clothing
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Islamic clothing — coming soon, in shaa Allah.
            </p>
            <Button
              onClick={() => setShowClothingComingSoon(false)}
              className="mt-8 w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12"
            >
              Check back later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
