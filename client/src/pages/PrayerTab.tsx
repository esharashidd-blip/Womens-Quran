import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useSettings } from "@/hooks/use-settings";
import { useQada, useUpdateQada } from "@/hooks/use-qada";
import { Loader2, Sunrise, Sun, Sunset, Moon, Plus, Minus, CircleDot, CalendarCheck, Compass, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const getPrayerIcon = (name: string) => {
  switch (name) {
    case 'Fajr': return <Sunrise className="w-5 h-5 text-amber-500" />;
    case 'Dhuhr': return <Sun className="w-5 h-5 text-orange-400" />;
    case 'Asr': return <Sun className="w-5 h-5 text-orange-300" />;
    case 'Maghrib': return <Sunset className="w-5 h-5 text-purple-400" />;
    case 'Isha': return <Moon className="w-5 h-5 text-blue-400" />;
    default: return <Sun className="w-5 h-5 text-gray-400" />;
  }
};

type Tab = 'times' | 'qada' | 'tasbih';

export default function PrayerTab() {
  const { data: settings } = useSettings();
  const city = settings?.city || "Mecca";
  const country = settings?.country || "Saudi Arabia";
  const { data: prayers, isLoading: prayersLoading } = usePrayerTimes(city, country);
  const { data: qadaList } = useQada();
  const updateQada = useUpdateQada();
  
  const [activeTab, setActiveTab] = useState<Tab>('times');
  const [tasbihCount, setTasbihCount] = useState(0);
  const tasbihTarget = settings?.tasbihCount || 33;

  const getQadaCount = (prayer: string) => {
    return qadaList?.find((q) => q.prayerName === prayer)?.count || 0;
  };

  const handleQadaIncrement = (prayer: string) => {
    const current = getQadaCount(prayer);
    updateQada.mutate({ prayerName: prayer, count: current + 1 });
  };

  const handleQadaDecrement = (prayer: string) => {
    const current = getQadaCount(prayer);
    if (current > 0) {
      updateQada.mutate({ prayerName: prayer, count: current - 1 });
    }
  };

  const totalMissed = PRAYERS.reduce((sum, p) => sum + getQadaCount(p), 0);

  const handleTasbihTap = () => {
    setTasbihCount(prev => prev + 1);
  };

  const resetTasbih = () => {
    setTasbihCount(0);
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-serif text-center">Prayer</h1>

      <div className="flex gap-2 p-1 bg-accent/30 rounded-2xl">
        {[
          { id: 'times' as Tab, label: 'Times', icon: Sun },
          { id: 'qada' as Tab, label: 'Qada', icon: CalendarCheck },
          { id: 'tasbih' as Tab, label: 'Tasbih', icon: CircleDot },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white shadow-sm text-foreground' 
                : 'text-muted-foreground'
            }`}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'times' && (
        <div className="space-y-4">
          <Card className="bg-white/80 border-white/50 rounded-2xl overflow-hidden">
            {prayersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            ) : (
              <div className="divide-y divide-primary/5">
                {PRAYERS.map((prayer) => (
                  <div key={prayer} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {getPrayerIcon(prayer)}
                      <span className="font-medium">{prayer}</span>
                    </div>
                    <span className="text-lg font-light text-muted-foreground">
                      {prayers?.timings[prayer]?.split(" ")[0]}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-accent/20">
                  <div className="flex items-center gap-3">
                    <Sunrise className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-muted-foreground">Sunrise</span>
                  </div>
                  <span className="text-lg font-light text-muted-foreground">
                    {prayers?.timings.Sunrise?.split(" ")[0]}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Link href="/qibla">
            <Card className="bg-white/80 border-white/50 p-4 rounded-2xl hover-elevate cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Compass className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Qibla Direction</p>
                    <p className="text-xs text-muted-foreground">Find the direction to pray</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        </div>
      )}

      {activeTab === 'qada' && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-5 rounded-2xl text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total Missed</p>
            <p className="text-5xl font-serif text-foreground" data-testid="text-total-missed">{totalMissed}</p>
            <p className="text-sm text-muted-foreground mt-1">prayers to make up</p>
          </Card>

          <Card className="bg-white/80 border-white/50 p-4 rounded-2xl">
            <div className="space-y-2">
              {PRAYERS.map((prayer) => (
                <div key={prayer} className="flex items-center justify-between bg-accent/30 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    {getPrayerIcon(prayer)}
                    <span className="font-medium text-sm">{prayer}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleQadaDecrement(prayer)}
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
                      onClick={() => handleQadaIncrement(prayer)}
                      data-testid={`button-increment-${prayer.toLowerCase()}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <p className="text-xs text-muted-foreground text-center px-4">
            Tap + to add missed prayers, tap - when you've made them up. May Allah accept your prayers.
          </p>
        </div>
      )}

      {activeTab === 'tasbih' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-8 rounded-3xl text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Count</p>
            <p className="text-7xl font-serif text-foreground mb-2" data-testid="text-tasbih-count">{tasbihCount}</p>
            <p className="text-sm text-muted-foreground">Target: {tasbihTarget}</p>
            
            {tasbihCount >= tasbihTarget && (
              <p className="text-primary font-medium mt-2">Target reached! MashaAllah</p>
            )}
          </Card>

          <button
            onClick={handleTasbihTap}
            className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-transform"
            data-testid="button-tasbih-tap"
          >
            <span className="text-lg font-medium">Tap</span>
          </button>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={resetTasbih} className="rounded-xl" data-testid="button-tasbih-reset">
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar'].map((dhikr) => (
              <Card key={dhikr} className="bg-white/60 border-white/50 p-3 rounded-xl text-center">
                <p className="text-xs font-medium text-muted-foreground">{dhikr}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
