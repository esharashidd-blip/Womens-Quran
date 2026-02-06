import { useQada, useUpdateQada } from "@/hooks/use-qada";
import { Loader2, Plus, Minus, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export default function Qada() {
  const { data: qadaList, isLoading } = useQada();
  const updateQada = useUpdateQada();

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

  const totalMissed = PRAYERS.reduce((sum, p) => sum + getQadaCount(p), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/more">
          <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-serif">Qada Tracker</h1>
          <p className="text-sm text-muted-foreground">Track and make up missed prayers</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-6 rounded-2xl text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total Missed</p>
        <p className="text-5xl font-serif text-foreground" data-testid="text-total-missed">{totalMissed}</p>
        <p className="text-sm text-muted-foreground mt-2">prayers to make up</p>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-white/50 p-4 rounded-2xl">
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

      <Card className="bg-accent/30 border-white/50 p-4 rounded-2xl">
        <p className="text-xs text-muted-foreground text-center">
          Tap + to add missed prayers, tap - when you've made them up. May Allah accept your prayers.
        </p>
      </Card>
    </div>
  );
}
