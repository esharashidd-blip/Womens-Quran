import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { Loader2, Sunrise, Sun, Sunset, Moon, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Prayer() {
  const { data: prayers, isLoading } = usePrayerTimes("Mecca", "Saudi Arabia");

  const prayerList = [
    { name: "Fajr", icon: Sunrise, color: "text-amber-500" },
    { name: "Dhuhr", icon: Sun, color: "text-orange-400" },
    { name: "Asr", icon: Sun, color: "text-orange-300" },
    { name: "Maghrib", icon: Sunset, color: "text-purple-400" },
    { name: "Isha", icon: Moon, color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 md:px-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-gray-800 mb-2">Prayer Times</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Mecca, Saudi Arabia</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : prayers ? (
        <div className="space-y-4">
          {prayerList.map((prayer) => {
            const Icon = prayer.icon;
            const time = prayers.timings[prayer.name as keyof typeof prayers.timings];
            return (
              <Card key={prayer.name} className="p-4 bg-white/80 backdrop-blur-sm border-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-primary/10 ${prayer.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-xl text-gray-800">{prayer.name}</span>
                  </div>
                  <span className="text-2xl font-light text-gray-600">{time?.split(' ')[0]}</span>
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
