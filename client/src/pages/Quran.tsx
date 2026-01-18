import { useSurahs } from "@/hooks/use-quran";
import { SurahCard } from "@/components/SurahCard";
import { useTodayQuranSession, useWeeklyQuranSessions, useUpdateQuranSession, calculateWeeklyMinutes } from "@/hooks/use-quran-sessions";
import { useSettings } from "@/hooks/use-settings";
import { Loader2, Search, BookOpen, Clock, Target, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Quran() {
  const { data: surahs, isLoading } = useSurahs();
  const { data: settings } = useSettings();
  const { data: todaySession } = useTodayQuranSession();
  const { data: weekSessions } = useWeeklyQuranSessions();
  const updateSession = useUpdateQuranSession();
  const [search, setSearch] = useState("");
  
  const [isReading, setIsReading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const goalMinutes = settings?.quranGoalMinutes || 10;
  const todayMinutes = (todaySession?.minutesRead || 0) + Math.floor(elapsedSeconds / 60);
  const weeklyMinutes = weekSessions ? calculateWeeklyMinutes(weekSessions) + Math.floor(elapsedSeconds / 60) : 0;
  const goalProgress = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  useEffect(() => {
    if (isReading) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReading]);

  const handleStartStop = () => {
    if (isReading && elapsedSeconds >= 60) {
      const additionalMinutes = Math.floor(elapsedSeconds / 60);
      const remainderSeconds = elapsedSeconds % 60;
      const newTotal = (todaySession?.minutesRead || 0) + additionalMinutes;
      updateSession.mutate({
        date: format(new Date(), "yyyy-MM-dd"),
        minutesRead: newTotal,
      });
      // Reset to remainder after saving full minutes
      setElapsedSeconds(remainderSeconds);
    }
    setIsReading(!isReading);
  };

  const handleReset = () => {
    if (elapsedSeconds >= 60) {
      const additionalMinutes = Math.floor(elapsedSeconds / 60);
      const newTotal = (todaySession?.minutesRead || 0) + additionalMinutes;
      updateSession.mutate({
        date: format(new Date(), "yyyy-MM-dd"),
        minutesRead: newTotal,
      });
    }
    setElapsedSeconds(0);
    setIsReading(false);
  };

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
    <div className="min-h-screen pb-24 pt-6 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-serif text-gray-800 text-center">Noble Quran</h1>
        
        <Card className="bg-gradient-to-br from-primary/10 to-accent/30 border-white/50 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-medium">Today's Reading</span>
            </div>
            <span className="text-sm text-muted-foreground">Goal: {goalMinutes} min</span>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted/30" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeDasharray={`${goalProgress} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold" data-testid="text-today-minutes">{todayMinutes}</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                {todayMinutes >= goalMinutes ? (
                  <span className="text-primary font-medium">Goal reached! MashaAllah</span>
                ) : (
                  <span>{goalMinutes - todayMinutes} min to reach goal</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">This week: {weeklyMinutes} minutes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center justify-center gap-2 bg-white/60 rounded-xl py-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xl font-mono font-medium" data-testid="text-reading-timer">{formatTime(elapsedSeconds)}</span>
            </div>
            <Button
              onClick={handleStartStop}
              className="rounded-xl px-6"
              variant={isReading ? "secondary" : "default"}
              data-testid="button-reading-toggle"
            >
              {isReading ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isReading ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset} className="rounded-xl" data-testid="button-reading-reset">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </Card>
        
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
