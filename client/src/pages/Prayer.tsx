import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Loader2, Sunrise, Sun, Sunset, Moon, MapPin, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Prayer() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [editMode, setEditMode] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const currentCity = settings?.city || "Mecca";
  const currentCountry = settings?.country || "Saudi Arabia";
  const { data: prayers, isLoading } = usePrayerTimes(currentCity, currentCountry);

  const prayerList = [
    { name: "Fajr", icon: Sunrise, color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Sunrise", icon: Sun, color: "text-orange-300", bg: "bg-orange-50" },
    { name: "Dhuhr", icon: Sun, color: "text-orange-400", bg: "bg-orange-50" },
    { name: "Asr", icon: Sun, color: "text-yellow-500", bg: "bg-yellow-50" },
    { name: "Maghrib", icon: Sunset, color: "text-purple-400", bg: "bg-purple-50" },
    { name: "Isha", icon: Moon, color: "text-blue-400", bg: "bg-blue-50" },
  ];

  const handleSaveLocation = () => {
    if (city && country) {
      updateSettings.mutate({ city, country });
      setEditMode(false);
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
            const detectedCity = data.city || data.locality || "Unknown";
            const detectedCountry = data.countryName || "Unknown";
            updateSettings.mutate({ city: detectedCity, country: detectedCountry, autoLocation: true });
          } catch (e) {
            console.error("Geocoding failed", e);
          }
        },
        (err) => console.error("Geolocation error", err)
      );
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 md:px-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-serif text-center mb-6">Prayer Times</h1>

      <Card className="bg-accent/30 border-white/50 p-4 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">{currentCity}, {currentCountry}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setEditMode(!editMode)}
            data-testid="button-edit-location"
          >
            Edit
          </Button>
        </div>

        {editMode && (
          <div className="space-y-3 pt-3 border-t border-white/30">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              data-testid="input-city"
            />
            <Input
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              data-testid="input-country"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveLocation} className="flex-1" data-testid="button-save-location">
                Save
              </Button>
              <Button variant="outline" onClick={handleAutoDetect} data-testid="button-auto-detect">
                <Navigation className="w-4 h-4 mr-1" /> Auto
              </Button>
            </div>
          </div>
        )}
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : prayers ? (
        <div className="space-y-3">
          {prayerList.map((prayer) => {
            const Icon = prayer.icon;
            const time = prayers.timings[prayer.name as keyof typeof prayers.timings];
            return (
              <Card key={prayer.name} className="bg-white/80 backdrop-blur-sm border-white/50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${prayer.bg}`}>
                      <Icon className={`w-5 h-5 ${prayer.color}`} />
                    </div>
                    <span className="font-medium">{prayer.name}</span>
                  </div>
                  <span className="text-xl font-light text-muted-foreground" data-testid={`text-time-${prayer.name.toLowerCase()}`}>
                    {time?.split(" ")[0]}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">Unable to load prayer times</p>
      )}
    </div>
  );
}
