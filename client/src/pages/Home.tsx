import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Loader2, Sunrise, Sun, Sunset, Moon, MapPin, Clock, ChevronRight, ChevronDown, Search, Navigation, Check } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";

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
  { city: "Berlin", country: "Germany" },
  { city: "Los Angeles", country: "United States" },
  { city: "Chicago", country: "United States" },
  { city: "Houston", country: "United States" },
  { city: "Riyadh", country: "Saudi Arabia" },
  { city: "Jeddah", country: "Saudi Arabia" },
  { city: "Doha", country: "Qatar" },
  { city: "Kuwait City", country: "Kuwait" },
  { city: "Amman", country: "Jordan" },
  { city: "Beirut", country: "Lebanon" },
  { city: "Casablanca", country: "Morocco" },
  { city: "Lagos", country: "Nigeria" },
  { city: "Karachi", country: "Pakistan" },
  { city: "Lahore", country: "Pakistan" },
  { city: "Dhaka", country: "Bangladesh" },
  { city: "Mumbai", country: "India" },
  { city: "Delhi", country: "India" },
  { city: "Singapore", country: "Singapore" },
];

const QUOTES = [
  "Indeed, with hardship comes ease. - Quran 94:6",
  "So remember Me; I will remember you. - Quran 2:152",
  "And He found you lost and guided you. - Quran 93:7",
  "My mercy encompasses all things. - Quran 7:156",
  "Allah does not burden a soul beyond that it can bear. - Quran 2:286",
];

export default function Home() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const city = settings?.city || "Mecca";
  const country = settings?.country || "Saudi Arabia";
  const { data: prayers, isLoading: prayersLoading } = usePrayerTimes(city, country);
  const [countdown, setCountdown] = useState("");
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return POPULAR_LOCATIONS;
    const query = locationSearch.toLowerCase();
    return POPULAR_LOCATIONS.filter(loc => 
      loc.city.toLowerCase().includes(query) || 
      loc.country.toLowerCase().includes(query)
    );
  }, [locationSearch]);

  const getNextPrayer = () => {
    if (!prayers) return null;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    const prayerList = [
      { name: "Fajr", time: prayers.timings.Fajr },
      { name: "Dhuhr", time: prayers.timings.Dhuhr },
      { name: "Asr", time: prayers.timings.Asr },
      { name: "Maghrib", time: prayers.timings.Maghrib },
      { name: "Isha", time: prayers.timings.Isha },
    ];

    for (const p of prayerList) {
      const timeClean = p.time.split(" ")[0];
      const [h, m] = timeClean.split(":").map(Number);
      const pVal = h * 60 + m;
      if (pVal > currentTimeVal) return { ...p, timeVal: pVal };
    }
    const fajrTime = prayerList[0].time.split(" ")[0];
    const [h, m] = fajrTime.split(":").map(Number);
    return { ...prayerList[0], timeVal: h * 60 + m + 24 * 60 };
  };

  const nextPrayer = getNextPrayer();

  useEffect(() => {
    if (!nextPrayer) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      let diff = nextPrayer.timeVal - currentMins;
      if (diff < 0) diff += 24 * 60;
      
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      setCountdown(`${hours}h ${mins}m`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextPrayer?.timeVal]);

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

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-5">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-serif text-foreground">
          Salam, <span className="text-primary italic">Sister</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          {format(new Date(), "EEEE, MMMM do")}
        </p>
        {prayers?.date?.hijri && (
          <p className="text-xs text-primary font-medium" data-testid="text-hijri-date">
            {prayers.date.hijri.day} {prayers.date.hijri.month?.en} {prayers.date.hijri.year} AH
          </p>
        )}
      </div>

      <button
        onClick={() => setShowLocationPicker(true)}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground mx-auto bg-white/60 px-4 py-2 rounded-full hover-elevate cursor-pointer transition-all border border-primary/10"
        data-testid="button-change-location"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span>{city}, {country}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-6 rounded-3xl shadow-lg">
        {prayersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-center mb-4">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Next Prayer</span>
              <h2 className="text-4xl font-serif text-foreground mt-1 font-medium" data-testid="text-next-prayer">
                {nextPrayer?.name}
              </h2>
              <p className="text-xl text-muted-foreground font-light">{nextPrayer?.time.split(" ")[0]}</p>
            </div>

            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium shadow-md">
              <Clock className="w-4 h-4" />
              <span data-testid="text-countdown">in {countdown}</span>
            </div>

            <div className="grid grid-cols-5 gap-2 w-full pt-5 mt-5 border-t border-white/30">
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
                <div key={p} className={`flex flex-col items-center gap-1 transition-all ${p === nextPrayer?.name ? 'opacity-100 scale-110' : 'opacity-60'}`}>
                  {p === 'Fajr' && <Sunrise className="w-4 h-4 text-amber-500" />}
                  {p === 'Dhuhr' && <Sun className="w-4 h-4 text-orange-400" />}
                  {p === 'Asr' && <Sun className="w-4 h-4 text-orange-300" />}
                  {p === 'Maghrib' && <Sunset className="w-4 h-4 text-purple-400" />}
                  {p === 'Isha' && <Moon className="w-4 h-4 text-blue-400" />}
                  <span className="text-[10px] font-semibold">{p.substring(0, 3)}</span>
                  <span className="text-[9px] text-muted-foreground">{prayers?.timings[p]?.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-white/50 p-5 rounded-2xl">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Daily Inspiration</p>
        <p className="font-serif text-base text-foreground leading-relaxed italic" data-testid="text-quote">
          "{quote}"
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
