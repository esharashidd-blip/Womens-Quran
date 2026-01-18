import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useSettings } from "@/hooks/use-settings";
import { Loader2, Sunrise, Sun, Sunset, Moon, MapPin, Clock, CircleDot, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

const QUOTES = [
  "Indeed, with hardship comes ease. - Quran 94:6",
  "So remember Me; I will remember you. - Quran 2:152",
  "And He found you lost and guided you. - Quran 93:7",
  "My mercy encompasses all things. - Quran 7:156",
  "Allah does not burden a soul beyond that it can bear. - Quran 2:286",
];

export default function Home() {
  const { data: settings } = useSettings();
  const city = settings?.city || "Mecca";
  const country = settings?.country || "Saudi Arabia";
  const { data: prayers, isLoading: prayersLoading } = usePrayerTimes(city, country);
  const [countdown, setCountdown] = useState("");
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

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

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 md:px-8 max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-serif text-foreground">
          Salam, <span className="text-primary italic">Sister</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          {format(new Date(), "EEEE, MMMM do")}
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-6 rounded-3xl shadow-lg">
        {prayersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-white/60 px-3 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {city}, {country}
            </div>
            
            <div className="text-center mb-4">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Next Prayer</span>
              <h2 className="text-4xl font-serif text-foreground mt-1 font-medium" data-testid="text-next-prayer">
                {nextPrayer?.name}
              </h2>
              <p className="text-xl text-muted-foreground font-light">{nextPrayer?.time.split(" ")[0]}</p>
            </div>

            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span data-testid="text-countdown">{countdown}</span>
            </div>

            <div className="grid grid-cols-5 gap-2 w-full pt-4 mt-4 border-t border-white/30">
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

      <Card className="bg-white/80 backdrop-blur-sm border-white/50 p-6 rounded-2xl">
        <p className="text-sm text-muted-foreground mb-2">Daily Inspiration</p>
        <p className="font-serif text-lg text-foreground leading-relaxed italic" data-testid="text-quote">
          "{quote}"
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/tasbih">
          <Card className="bg-accent/50 border-white/50 p-4 rounded-2xl text-center hover-elevate cursor-pointer" data-testid="link-tasbih">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <CircleDot className="w-5 h-5 text-primary" />
            </div>
            <p className="font-medium text-sm">Tasbih</p>
          </Card>
        </Link>
        <Link href="/more">
          <Card className="bg-accent/50 border-white/50 p-4 rounded-2xl text-center hover-elevate cursor-pointer" data-testid="link-qada">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <p className="font-medium text-sm">Qada Tracker</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
