import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useSettings } from "@/hooks/use-settings";
import { useQada, useUpdateQada } from "@/hooks/use-qada";
import { useTodayProgress, useWeeklyProgress, useUpdatePrayerProgress, calculateWeeklyStats } from "@/hooks/use-prayer-progress";
import { Loader2, Sunrise, Sun, Sunset, Moon, Plus, Minus, CircleDot, CalendarCheck, Compass, ChevronRight, ChevronLeft, UtensilsCrossed, Check, BellOff, Share2, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth } from "date-fns";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const getPrayerEmoji = (name: string) => {
  switch (name) {
    case 'Fajr': return '✨';
    case 'Dhuhr': return '🌞';
    case 'Asr': return '🌤️';
    case 'Maghrib': return '🌅';
    case 'Isha': return '🌙';
    default: return '☀️';
  }
};

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
  const { data: todayProgress } = useTodayProgress();
  const { data: weeklyProgress } = useWeeklyProgress();
  const updateProgress = useUpdatePrayerProgress();

  const [activeTab, setActiveTab] = useState<Tab>('times');
  const [tasbihCount, setTasbihCount] = useState(0);
  const tasbihTarget = settings?.tasbihCount || 33;
  const [viewMode, setViewMode] = useState<'Week' | 'Month'>('Week');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const today = format(new Date(), "yyyy-MM-dd");
  const todayDate = new Date();

  // Get days for the current view
  const displayDays = useMemo(() => {
    if (viewMode === 'Week') {
      const start = currentWeekStart;
      const end = endOfWeek(start, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentWeekStart);
      const end = endOfMonth(currentWeekStart);
      return eachDayOfInterval({ start, end });
    }
  }, [currentWeekStart, viewMode]);

  // Calculate prayer completion for each day
  // In Cycle Mode, show all prayers as completed to remove guilt
  const getDayCompletion = (date: Date): number => {
    if (settings?.cycleMode) return 5; // Show full completion in Cycle Mode
    if (!weeklyProgress) return 0;
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayProgress = weeklyProgress.find(p => p.date === dateStr);
    if (!dayProgress) return 0;
    let count = 0;
    if (dayProgress.fajr) count++;
    if (dayProgress.dhuhr) count++;
    if (dayProgress.asr) count++;
    if (dayProgress.maghrib) count++;
    if (dayProgress.isha) count++;
    return count;
  };

  const isPrayerCompleted = (prayer: string) => {
    if (!todayProgress) return false;
    const key = prayer.toLowerCase() as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    return todayProgress[key] || false;
  };

  const togglePrayer = (prayer: string) => {
    // If in cycle mode, we still allow tracking but it's optional
    const completed = !isPrayerCompleted(prayer);
    updateProgress.mutate({ date: today, prayer, completed });
  };

  const markAllAsPrayed = () => {
    PRAYERS.forEach(prayer => {
      if (!isPrayerCompleted(prayer)) {
        updateProgress.mutate({ date: today, prayer, completed: true });
      }
    });
  };

  const completedCount = PRAYERS.filter(p => isPrayerCompleted(p)).length;
  const allCompleted = completedCount === 5;

  // Get the next prayer
  const getNextPrayer = () => {
    if (!prayers) return null;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMin;

    for (const p of PRAYERS) {
      const timeStr = prayers.timings[p];
      if (!timeStr) continue;
      const timeClean = timeStr.split(" ")[0];
      const [h, m] = timeClean.split(":").map(Number);
      const pVal = h * 60 + m;
      if (pVal > currentTimeVal) return p;
    }
    return null;
  };

  const nextPrayer = getNextPrayer();

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

      {settings?.cycleMode && (
        <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100 p-5 rounded-2xl animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <p className="font-serif text-rose-800 text-lg leading-tight">Relax & Restore</p>
              <p className="text-rose-600/80 text-sm mt-0.5">Take this time to care for yourself. Your prayers are marked as complete and your streak is safe.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-2 p-1 bg-accent/30 rounded-2xl">
        {[
          { id: 'times' as Tab, label: 'Times', icon: Sun },
          { id: 'qada' as Tab, label: 'Qada', icon: CalendarCheck },
          { id: 'tasbih' as Tab, label: 'Tasbih', icon: CircleDot },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
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
          {settings?.ramadanMode && prayers && (
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 p-5 rounded-2xl" data-testid="card-ramadan-times">
              <div className="flex items-center justify-center gap-2 mb-4">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                <span className="font-serif text-lg text-emerald-700">Ramadan Times</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-emerald-600/70 mb-1">Suhoor Ends</p>
                  <p className="text-2xl font-serif text-emerald-700" data-testid="text-suhoor-time">
                    {(prayers.timings.Imsak || prayers.timings.Fajr)?.split(" ")[0] || "--:--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Stop eating</p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-emerald-600/70 mb-1">Iftar</p>
                  <p className="text-2xl font-serif text-emerald-700" data-testid="text-iftar-time">
                    {prayers.timings.Maghrib?.split(" ")[0] || "--:--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Break fast</p>
                </div>
              </div>
            </Card>
          )}

          {/* Prayer Times List with Checkboxes */}
          <Card className="bg-white/80 border-white/50 rounded-2xl overflow-hidden">
            {prayersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            ) : (
              <div className="divide-y divide-primary/5">
                {/* Sunrise info */}
                {prayers && (
                  <div className="px-4 py-2 bg-accent/20 text-center text-sm text-muted-foreground">
                    Imsak {(prayers.timings.Imsak || prayers.timings.Fajr)?.split(" ")[0]} | Sunrise {prayers.timings.Sunrise?.split(" ")[0]}
                  </div>
                )}

                {PRAYERS.map((prayer) => {
                  const isCompleted = isPrayerCompleted(prayer);
                  const isNext = prayer === nextPrayer;

                  return (
                    <button
                      key={prayer}
                      onClick={() => togglePrayer(prayer)}
                      className={`w-full flex items-center justify-between p-4 transition-all ${isCompleted ? 'bg-primary/5' : ''
                        } ${isNext && !settings?.cycleMode ? 'bg-primary/10' : ''} ${settings?.cycleMode ? 'opacity-80' : ''}`}
                      data-testid={`prayer-row-${prayer.toLowerCase()}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox circle */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted
                          ? settings?.cycleMode ? 'bg-rose-400 border-rose-400' : 'bg-primary border-primary'
                          : 'border-muted-foreground/30'
                          }`}>
                          {isCompleted && <Check className="w-4 h-4 text-white" />}
                        </div>

                        <span className={`font-medium ${isCompleted ? 'text-muted-foreground' : ''}`}>
                          {prayer}
                        </span>
                        <span className="text-lg">{getPrayerEmoji(prayer)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isNext && !settings?.cycleMode && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                            Now
                          </span>
                        )}
                        {settings?.cycleMode && (
                          <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">
                            Cycle Mode
                          </span>
                        )}
                        <span className={`text-lg font-light ${isCompleted ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                          {prayers?.timings[prayer]?.split(" ")[0]}
                        </span>
                        <BellOff className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Mark All as Prayed Button - Hidden in Cycle Mode */}
          {!settings?.cycleMode && !allCompleted && (
            <Button
              onClick={markAllAsPrayed}
              className="w-full rounded-full bg-primary hover:bg-primary/90"
              data-testid="button-mark-all-prayed"
            >
              Mark all as prayed
            </Button>
          )}

          {settings?.cycleMode ? (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 p-4 rounded-2xl text-center">
              <p className="text-purple-700 font-serif italic text-sm">
                "Allah knows your body better than you do. Resting is not falling behind."
              </p>
              <p className="text-xs text-purple-500 mt-2">
                Focus on dhikr, du'a, and listening to Quran
              </p>
            </Card>
          ) : allCompleted && (
            <div className="text-center py-2">
              <p className="text-primary font-medium">MashaAllah! All prayers completed today</p>
            </div>
          )}

          {/* Your Progress Section */}
          <div className="pt-2">
            <p className="text-foreground font-medium mb-4">Your Progress</p>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-5 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                {/* Week/Month Toggle */}
                <div className="flex bg-white/60 rounded-full p-1">
                  <button
                    onClick={() => setViewMode('Week')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'Week' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode('Month')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'Month' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                  >
                    Month
                  </button>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (viewMode === 'Week') setCurrentWeekStart(prev => subWeeks(prev, 1));
                      else setCurrentWeekStart(prev => subMonths(prev, 1));
                    }}
                    className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      if (viewMode === 'Week') setCurrentWeekStart(prev => addWeeks(prev, 1));
                      else setCurrentWeekStart(prev => addMonths(prev, 1));
                    }}
                    className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className={`grid ${viewMode === 'Week' ? 'grid-cols-7' : 'grid-cols-7'} gap-y-4 gap-x-2 mb-4`}>
                {viewMode === 'Week' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {day}
                  </div>
                ))}
                {displayDays.map((day) => {
                  const dayNum = format(day, 'd');
                  const completion = getDayCompletion(day);
                  const isToday = isSameDay(day, todayDate);
                  const isDiffMonth = !isSameMonth(day, currentWeekStart);
                  const completionPercent = (completion / 5) * 100;

                  return (
                    <div key={day.toISOString()} className={`flex flex-col items-center gap-1.5 ${isDiffMonth ? 'opacity-20' : ''}`}>
                      <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-foreground/60'}`}>
                        {dayNum}
                      </span>
                      {/* Circular progress indicator */}
                      <div className="relative w-7 h-7">
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            className="stroke-primary/10"
                            strokeWidth="4"
                          />
                          {completion > 0 && (
                            <circle
                              cx="18"
                              cy="18"
                              r="14"
                              fill="none"
                              className={cn(
                                "transition-all duration-1000 ease-out",
                                settings?.cycleMode ? "stroke-rose-400" : "stroke-primary"
                              )}
                              strokeWidth="4"
                              strokeDasharray={`${completionPercent * 0.88} 100`}
                              strokeLinecap="round"
                            />
                          )}
                        </svg>
                        {completion === 5 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className={`w-3 h-3 ${settings?.cycleMode ? 'text-rose-500' : 'text-primary'}`} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Month label and share button */}
              <div className="flex items-center justify-between pt-3 border-t border-primary/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {format(currentWeekStart, 'MMMM yyyy')}
                  </span>
                </div>
                <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </Card>
          </div>

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
          <Card className={`bg-gradient-to-br ${settings?.cycleMode ? 'from-rose-50 to-orange-50 border-rose-100' : 'from-primary/10 to-accent/30 border-white/50'} p-5 rounded-2xl text-center`}>
            {settings?.cycleMode ? (
              <div className="py-2">
                <Heart className="w-10 h-10 text-rose-500 fill-rose-500 mx-auto mb-3" />
                <p className="text-xs uppercase tracking-widest text-rose-600 mb-1">Focus on Heart</p>
                <p className="text-lg font-serif text-rose-800 italic">No makeup prayers today</p>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total Missed</p>
                <p className="text-5xl font-serif text-foreground" data-testid="text-total-missed">{totalMissed}</p>
                <p className="text-sm text-muted-foreground mt-1">prayers to make up</p>
              </>
            )}
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
