import { useRandomVerse } from "@/hooks/use-quran";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { Loader2, Sunrise, Sun, Sunset, Moon, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: verse, isLoading: verseLoading } = useRandomVerse();
  const { data: prayers, isLoading: prayersLoading } = usePrayerTimes("Mecca", "Saudi Arabia");

  // Get next prayer
  const getNextPrayer = () => {
    if (!prayers) return null;
    const now = new Date();
    const times = prayers.timings;
    const timeFormat = "HH:mm";
    // This is a simplified check - in a real app use moment/date-fns to parse times strictly
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    const prayerList = [
      { name: "Fajr", time: times.Fajr },
      { name: "Dhuhr", time: times.Dhuhr },
      { name: "Asr", time: times.Asr },
      { name: "Maghrib", time: times.Maghrib },
      { name: "Isha", time: times.Isha },
    ];

    for (const p of prayerList) {
      const [h, m] = p.time.split(":").map(Number);
      const pVal = h * 60 + m;
      if (pVal > currentTimeVal) return p;
    }
    return { name: "Fajr", time: times.Fajr }; // Next day Fajr
  };

  const nextPrayer = getNextPrayer();

  return (
    <div className="min-h-screen pb-24 px-4 pt-16 md:px-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif text-gray-800">
          Salam, <span className="text-primary italic">Sister</span>
        </h1>
        <p className="text-muted-foreground font-light">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </p>
      </div>

      {/* Prayer Time Card */}
      <div className="relative bg-gradient-to-br from-[#FFF0F5] to-[#FFE4E1] rounded-3xl p-6 shadow-xl shadow-primary/5 border border-white">
        {prayersLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-white/50 px-3 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> Mecca, SA
            </div>
            
            <div className="text-center mb-6">
              <span className="text-sm uppercase tracking-widest text-gray-500">Next Prayer</span>
              <h2 className="text-5xl font-serif text-primary-dark mt-2 font-medium">
                {nextPrayer?.name}
              </h2>
              <p className="text-2xl text-gray-400 font-light mt-1">{nextPrayer?.time}</p>
            </div>

            <div className="grid grid-cols-5 gap-2 w-full pt-4 border-t border-primary/10">
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((p) => (
                <div key={p} className={`flex flex-col items-center gap-1 ${p === nextPrayer?.name ? 'opacity-100 scale-110' : 'opacity-50'}`}>
                   {p === 'Fajr' && <Sunrise className="w-4 h-4 text-primary" />}
                   {p === 'Dhuhr' && <Sun className="w-4 h-4 text-orange-400" />}
                   {p === 'Asr' && <Sun className="w-4 h-4 text-orange-300" />}
                   {p === 'Maghrib' && <Sunset className="w-4 h-4 text-purple-400" />}
                   {p === 'Isha' && <Moon className="w-4 h-4 text-blue-400" />}
                   <span className="text-[10px] font-bold">{p.substring(0, 3)}</span>
                   <span className="text-[10px]">{prayers?.timings[p as keyof typeof prayers.timings].split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verse of the Day */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl pl-2 border-l-4 border-primary/40">Verse of the Day</h3>
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10" />
          
          {verseLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : verse ? (
            <>
              <div className="text-right mb-6" dir="rtl">
                <p className="font-arabic text-2xl leading-loose text-gray-800">{verse.arabicText}</p>
              </div>
              <p className="font-serif text-lg text-gray-600 leading-relaxed italic">"{verse.translationText}"</p>
              <div className="mt-6 flex justify-between items-center text-sm text-primary font-medium border-t border-gray-100 pt-4">
                <span>{verse.surah.englishName} {verse.surah.number}:{verse.ayahNumber}</span>
                <Link href={`/surah/${verse.surah.number}`}>
                  <span className="cursor-pointer hover:underline">Read Surah &rarr;</span>
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Quick Action */}
      <Link href="/quran">
        <Button className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-primary to-rose-400 hover:shadow-lg hover:shadow-primary/30 transition-all">
          Start Reading Quran
        </Button>
      </Link>
    </div>
  );
}
