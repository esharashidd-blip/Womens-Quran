import { useSurahs } from "@/hooks/use-quran";
import { SurahCard } from "@/components/SurahCard";
import { useTodayQuranSession, useWeeklyQuranSessions, calculateWeeklyMinutes } from "@/hooks/use-quran-sessions";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useQuranTimer } from "@/contexts/QuranTimerContext";
import { Loader2, Search, BookOpen, Clock, Play, Pause, RotateCcw, TrendingUp, Bookmark } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuranBookmark } from "@/hooks/use-quran-bookmark";
import { Link } from "wouter";

// Total Quran pages (standard Uthmani mushaf)
const TOTAL_QURAN_PAGES = 604;
const AVG_MINUTES_PER_PAGE = 2.5; // Average reading time per page

export default function Quran() {
  const { data: surahs, isLoading } = useSurahs();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { data: todaySession } = useTodayQuranSession();
  const { data: weekSessions } = useWeeklyQuranSessions();
  const { elapsedSeconds, isReading, toggleTimer, resetTimer } = useQuranTimer();
  const { data: bookmark } = useQuranBookmark();
  const [search, setSearch] = useState("");

  const goalMinutes = settings?.quranGoalMinutes || 10;
  const todayMinutes = (todaySession?.minutesRead || 0) + Math.floor(elapsedSeconds / 60);
  const weeklyMinutes = weekSessions ? calculateWeeklyMinutes(weekSessions) + Math.floor(elapsedSeconds / 60) : 0;
  const goalProgress = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  // Calculate completion estimate based on goal or average
  const calculateCompletionEstimate = () => {
    // Total minutes to finish Quran: 604 pages * 2.5 min/page = 1510 mins
    const totalMinutesNeeded = TOTAL_QURAN_PAGES * AVG_MINUTES_PER_PAGE;

    // Instead of using only past performance, let's use the selected goal for the informational message
    const pagesPerDay = goalMinutes / AVG_MINUTES_PER_PAGE;

    if (pagesPerDay <= 0) return null;

    const daysToComplete = Math.ceil(TOTAL_QURAN_PAGES / pagesPerDay);
    return daysToComplete;
  };

  const completionDays = calculateCompletionEstimate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSurahs = surahs?.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
    s.number.toString().includes(search)
  );

  return (
    <div className="min-h-screen pb-nav-safe pt-6 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-serif text-gray-800 text-center">Noble Quran</h1>

        <Card className={`bg-gradient-to-br ${settings?.cycleMode ? 'from-purple-50 to-pink-50 border-purple-100 shadow-sm' : 'from-primary/10 to-accent/30 border-white/50 shadow-md'} p-5 rounded-2xl transition-all duration-500`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className={`w-5 h-5 ${settings?.cycleMode ? 'text-purple-600' : 'text-primary'}`} />
              <span className="font-medium">{settings?.cycleMode ? "Reading & Reflection" : "Today's Reading"}</span>
            </div>
            {!settings?.cycleMode && <span className="text-sm text-muted-foreground">Goal: {goalMinutes} min</span>}
            {settings?.cycleMode && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Cycle Mode</span>}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted/30" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  className={settings?.cycleMode ? "stroke-purple-400" : "stroke-primary"}
                  strokeWidth="3"
                  strokeDasharray={settings?.cycleMode ? "100 100" : `${goalProgress} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-semibold ${settings?.cycleMode ? 'text-purple-700' : ''}`} data-testid="text-today-minutes">{todayMinutes}</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  {settings?.cycleMode ? (
                    <span className="text-purple-700 font-medium">Focus on listening & heart</span>
                  ) : todayMinutes >= goalMinutes ? (
                    <span className="text-primary font-medium">Goal reached! MashaAllah</span>
                  ) : (
                    <span>{goalMinutes - todayMinutes} min to reach goal</span>
                  )}
                </p>
                {!settings?.cycleMode && (
                  <div className="flex gap-1">
                    {[10, 20, 30].map((m) => (
                      <button
                        key={m}
                        onClick={() => updateSettings.mutate({ quranGoalMinutes: m })}
                        className={`text-[10px] px-2 py-1 rounded-md transition-all ${goalMinutes === m
                          ? 'bg-primary text-white font-bold'
                          : 'bg-white/50 text-muted-foreground hover:bg-white'
                          }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {settings?.cycleMode ? "Your streak is protected" : `Daily Goal: ${goalMinutes} mins • This week: ${weeklyMinutes}m`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex-1 flex items-center justify-center gap-2 ${settings?.cycleMode ? 'bg-purple-100/50 text-purple-700' : 'bg-white/60 text-primary'} rounded-xl py-3`}>
              <Clock className="w-4 h-4" />
              <span className="text-xl font-mono font-medium" data-testid="text-reading-timer">{formatTime(elapsedSeconds)}</span>
            </div>
            <Button
              onClick={toggleTimer}
              className={`rounded-xl px-6 ${settings?.cycleMode ? 'bg-purple-500 hover:bg-purple-600 border-none' : ''}`}
              variant={isReading ? "secondary" : "default"}
              data-testid="button-reading-toggle"
            >
              {isReading ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isReading ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" size="icon" onClick={resetTimer} className="rounded-xl" data-testid="button-reading-reset">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Completion Estimator */}
          {completionDays && !settings?.cycleMode && (
            <div className="mt-4 pt-4 border-t border-primary/10 flex items-start gap-3 animate-in fade-in duration-500">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-foreground">
                  At this pace, you will finish the Qur’an in approximately <span className="font-semibold text-primary">{completionDays} days</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Purely informational to help you plan your journey. 🤍
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Continue Reading Bookmark */}
        {bookmark && (
          <Link href={`/surah/${bookmark.surahNumber}`}>
            <Card className="bg-gradient-to-r from-primary/10 to-accent/20 border-primary/10 p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bookmark className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Continue Reading</p>
                  <p className="text-xs text-muted-foreground">{bookmark.surahName} - Ayah {bookmark.ayahNumber}</p>
                </div>
                <span className="text-xs text-primary font-medium">Resume</span>
              </div>
            </Card>
          </Link>
        )}

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search Surah..."
            className="pl-10 h-12 rounded-2xl bg-white border-pink-100 focus:border-primary focus:ring-primary/20 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-surah"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary/60">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p>Loading Surahs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs?.map((surah, index) => (
            <SurahCard key={surah.number} surah={surah} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
