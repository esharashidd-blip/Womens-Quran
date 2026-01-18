import { useQada, useUpdateQada } from "@/hooks/use-qada";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Loader2, Plus, Minus, MapPin, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export default function More() {
  const { data: qadaList, isLoading: qadaLoading } = useQada();
  const updateQada = useUpdateQada();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [editLocation, setEditLocation] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const getQadaCount = (prayer: string) => {
    return qadaList?.find((q) => q.prayerName === prayer)?.count || 0;
  };

  const handleIncrement = (prayer: string) => {
    const current = getQadaCount(prayer);
    updateQada.mutate({ prayerName: prayer, count: current + 1 });
  };

  const handleDecrement = (prayer: string) => {
    const current = getQadaCount(prayer);
    if (current > 0) {
      updateQada.mutate({ prayerName: prayer, count: current - 1 });
    }
  };

  const handleSaveLocation = () => {
    if (city && country) {
      updateSettings.mutate({ city, country });
      setEditLocation(false);
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
            updateSettings.mutate({
              city: data.city || data.locality || "Unknown",
              country: data.countryName || "Unknown",
              autoLocation: true,
            });
          } catch (e) {
            console.error("Geocoding failed", e);
          }
        },
        (err) => console.error("Geolocation error", err)
      );
    }
  };

  if (settingsLoading || qadaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 md:px-8 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-serif text-center">Settings & More</h1>

      <Card className="bg-white/80 backdrop-blur-sm border-white/50 p-4 rounded-2xl">
        <h2 className="font-medium mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Location
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          {settings?.city || "Mecca"}, {settings?.country || "Saudi Arabia"}
        </p>
        
        {editLocation ? (
          <div className="space-y-3">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              data-testid="input-city-more"
            />
            <Input
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              data-testid="input-country-more"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveLocation} size="sm" className="flex-1">
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleAutoDetect}>
                <Navigation className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditLocation(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditLocation(true)} data-testid="button-edit-location-more">
            Change Location
          </Button>
        )}
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-white/50 p-4 rounded-2xl">
        <h2 className="font-medium mb-4">Qada (Missed Prayers) Tracker</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Track missed prayers and decrease as you make them up
        </p>
        
        <div className="space-y-3">
          {PRAYERS.map((prayer) => (
            <div key={prayer} className="flex items-center justify-between bg-accent/30 rounded-xl p-3">
              <span className="font-medium text-sm">{prayer}</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleDecrement(prayer)}
                  disabled={getQadaCount(prayer) === 0}
                  data-testid={`button-decrement-${prayer.toLowerCase()}`}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium" data-testid={`text-qada-${prayer.toLowerCase()}`}>
                  {getQadaCount(prayer)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleIncrement(prayer)}
                  data-testid={`button-increment-${prayer.toLowerCase()}`}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
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
    </div>
  );
}
