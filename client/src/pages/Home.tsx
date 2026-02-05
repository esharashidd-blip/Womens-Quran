import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useTodayProgress, useWeeklyProgress, useUpdatePrayerProgress } from "@/hooks/use-prayer-progress";
import { useProgrammeProgress } from "@/hooks/use-programme-progress";
import { Loader2, Sunrise, Sun, Sunset, Moon, MapPin, Clock, ChevronDown, Search, Navigation, Check, Flame, Heart, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { NamePrompt } from "@/components/NamePrompt";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();
  const updateSettings = useUpdateSettings();
  const city = settings?.city || "Mecca";
  const country = settings?.country || "Saudi Arabia";
  const { data: prayers, isLoading: prayersLoading } = usePrayerTimes(city, country);
  const { data: todayProgress } = useTodayProgress();
  const { data: weeklyProgress } = useWeeklyProgress();
  const updateProgress = useUpdatePrayerProgress();
  const { data: menstrualProgress } = useProgrammeProgress("menstrual-guide");
  const [countdown, setCountdown] = useState("");
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  // Geolocation is available (native bridge provides it in iOS app)
  const canUseGeolocation = 'geolocation' in navigator;

  // Get display name from auth user
  const displayName = user?.firstName;

  // Show name prompt if user hasn't set their name yet (only once per session)
  useEffect(() => {
    if (user && !displayName && !sessionStorage.getItem('namePromptShown')) {
      setShowNamePrompt(true);
      sessionStorage.setItem('namePromptShown', 'true');
    }
  }, [user, displayName]);

  const today = format(new Date(), "yyyy-MM-dd");

  // Calculate prayer streak (consecutive days with all 5 prayers completed)
  const prayerStreak = useMemo(() => {
    if (!weeklyProgress) return 0;

    let streak = 0;
    const todayDate = new Date();

    // Check from today backwards - no limit on streak length
    for (let i = 0; i < 366; i++) {
      const checkDate = subDays(todayDate, i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayProgress = weeklyProgress.find(p => p.date === dateStr);

      if (!dayProgress) {
        // If checking today and no progress yet, skip to yesterday
        if (i === 0) continue;
        break;
      }

      const allCompleted = dayProgress.fajr && dayProgress.dhuhr && dayProgress.asr && dayProgress.maghrib && dayProgress.isha;

      if (allCompleted) {
        streak++;
      } else if (i > 0) {
        // If not today and not all completed, streak breaks
        break;
      }
    }

    return streak;
  }, [weeklyProgress]);

  const isPrayerCompleted = (prayer: string) => {
    if (!todayProgress) return false;
    const key = prayer.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    return todayProgress[key] || false;
  };

  const togglePrayer = (prayer: string) => {
    const completed = !isPrayerCompleted(prayer);
    updateProgress.mutate({ date: today, prayer, completed });
  };

  // Auto-complete prayers in Cycle Mode
  useEffect(() => {
    if (settings?.cycleMode && prayers) {
      const pNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      pNames.forEach(p => {
        if (!isPrayerCompleted(p)) {
          updateProgress.mutate({ date: today, prayer: p, completed: true });
        }
      });
    }
  }, [settings?.cycleMode, prayers, todayProgress]);

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

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-5">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-serif text-foreground">
          Salam{displayName ? `, ${displayName}` : ''} <span className="text-primary">🤍</span>
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
                {settings?.cycleMode ? "Time to Relax" : nextPrayer?.name}
              </h2>
              <p className="text-xl text-muted-foreground font-light">
                {settings?.cycleMode ? "Your streak is protected" : nextPrayer?.time.split(" ")[0]}
              </p>
            </div>

            <div className={`flex items-center gap-2 ${settings?.cycleMode ? 'bg-rose-100 text-rose-700' : 'bg-primary text-primary-foreground'} px-5 py-2.5 rounded-full text-sm font-medium shadow-md`}>
              {settings?.cycleMode ? (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Cycle Mode Active</span>
                </div>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span data-testid="text-countdown">in {countdown}</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 w-full pt-5 mt-5 border-t border-white/30">
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
                <button
                  key={p}
                  onClick={() => togglePrayer(p)}
                  className={`flex flex-col items-center gap-1 transition-all py-2 rounded-xl ${isPrayerCompleted(p)
                    ? 'bg-primary/20 opacity-100'
                    : p === nextPrayer?.name
                      ? 'opacity-100 scale-105'
                      : 'opacity-60'
                    }`}
                  data-testid={`button-toggle-prayer-${p.toLowerCase()}`}
                >
                  {isPrayerCompleted(p) ? (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <>
                      {p === 'Fajr' && <Sunrise className="w-4 h-4 text-amber-500" />}
                      {p === 'Dhuhr' && <Sun className="w-4 h-4 text-orange-400" />}
                      {p === 'Asr' && <Sun className="w-4 h-4 text-orange-300" />}
                      {p === 'Maghrib' && <Sunset className="w-4 h-4 text-purple-400" />}
                      {p === 'Isha' && <Moon className="w-4 h-4 text-blue-400" />}
                    </>
                  )}
                  <span className="text-[10px] font-semibold">{p.substring(0, 3)}</span>
                  <span className="text-[9px] text-muted-foreground">{prayers?.timings[p]?.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Streak Section - Updated for Cycle Mode */}
      <Card className={`bg-gradient-to-br ${settings?.cycleMode ? 'from-rose-50 to-orange-50 border-rose-100 shadow-sm' : 'from-primary/10 to-accent/30 border-white/50 shadow-md'} p-5 rounded-3xl transition-all duration-500`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{settings?.cycleMode ? "Streak Protection" : "Prayer Streak"}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-4xl font-serif ${settings?.cycleMode ? 'text-rose-600' : 'text-foreground'}`} data-testid="text-prayer-streak">{prayerStreak}</span>
              <span className="text-muted-foreground text-sm">days</span>
            </div>
          </div>
          <div className={`w-14 h-14 ${settings?.cycleMode ? 'bg-rose-100' : 'bg-primary/20'} rounded-full flex items-center justify-center`}>
            {settings?.cycleMode ? <Heart className="w-7 h-7 text-rose-500 fill-rose-500" /> : <Flame className="w-7 h-7 text-primary" />}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          {settings?.cycleMode
            ? "Allah knows your body better than you do. Your streak is protected while you rest. ✨"
            : prayerStreak === 0
              ? "Complete all 5 prayers today to start your streak!"
              : `Keep it up! You've completed all prayers for ${prayerStreak} day${prayerStreak !== 1 ? 's' : ''} in a row.`}
        </p>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-white/50 p-5 rounded-2xl">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Daily Inspiration</p>
        <p className="font-serif text-base text-foreground leading-relaxed italic" data-testid="text-quote">
          "{quote}"
        </p>
      </Card>

      {settings?.cycleMode && (
        <Link href="/menstrual-guide">
          <Card className="bg-gradient-to-br from-purple-50 to-rose-50 border-purple-100 p-5 rounded-3xl shadow-sm cursor-pointer hover:shadow-md transition-all group overflow-hidden relative mt-5">
            <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Heart className="w-24 h-24 text-purple-600 fill-purple-600" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">
                🌸
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Recommended for you</p>
                <h3 className="text-xl font-serif text-purple-900">Menstrual Guide</h3>
                <p className="text-xs text-purple-600/70 mt-0.5">
                  Day {menstrualProgress?.currentDay !== undefined ? (menstrualProgress.currentDay + 1) : 1} — Gentle faith-based support
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      )}

      {showLocationPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center pb-[calc(4rem+env(safe-area-inset-bottom))]" onClick={() => !updateSettings.isPending && setShowLocationPicker(false)}>
          <Card
            className="w-full max-w-lg bg-background border-t border-white/50 rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[70vh] flex flex-col"
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

      {showNamePrompt && (
        <NamePrompt onComplete={() => setShowNamePrompt(false)} />
      )}

    </div>
  );
}
