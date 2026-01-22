import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useTodayQuranSession, useUpdateQuranSession } from '@/hooks/use-quran-sessions';
import { format } from 'date-fns';

interface QuranTimerContextType {
  elapsedSeconds: number;
  isReading: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  toggleTimer: () => void;
}

const QuranTimerContext = createContext<QuranTimerContextType | undefined>(undefined);

const STORAGE_KEY = 'quran_timer_state';

interface TimerState {
  elapsedSeconds: number;
  isReading: boolean;
  lastUpdate: number;
  date: string;
}

export function QuranTimerProvider({ children }: { children: ReactNode }) {
  const { data: todaySession } = useTodayQuranSession();
  const updateSession = useUpdateQuranSession();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: TimerState = JSON.parse(savedState);
        const today = format(new Date(), 'yyyy-MM-dd');

        // Only restore if it's the same day
        if (state.date === today) {
          // If timer was running, calculate elapsed time since last update
          if (state.isReading) {
            const secondsSinceLastUpdate = Math.floor((Date.now() - state.lastUpdate) / 1000);
            // Cap at 30 minutes to prevent huge jumps if app was closed for a long time
            const additionalSeconds = Math.min(secondsSinceLastUpdate, 30 * 60);
            setElapsedSeconds(state.elapsedSeconds + additionalSeconds);
            setIsReading(true);
          } else {
            setElapsedSeconds(state.elapsedSeconds);
          }
        }
      } catch (e) {
        console.error('Failed to parse timer state:', e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state: TimerState = {
      elapsedSeconds,
      isReading,
      lastUpdate: Date.now(),
      date: format(new Date(), 'yyyy-MM-dd'),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [elapsedSeconds, isReading]);

  // Timer interval
  useEffect(() => {
    if (isReading) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isReading]);

  // Auto-save to database every minute while reading
  useEffect(() => {
    if (isReading && elapsedSeconds > 0 && elapsedSeconds % 60 === 0) {
      const now = Date.now();
      // Prevent saving more than once per 30 seconds
      if (now - lastSaveRef.current > 30000) {
        saveProgress();
        lastSaveRef.current = now;
      }
    }
  }, [elapsedSeconds, isReading]);

  const saveProgress = useCallback(() => {
    if (elapsedSeconds >= 60) {
      const additionalMinutes = Math.floor(elapsedSeconds / 60);
      const remainderSeconds = elapsedSeconds % 60;
      const newTotal = (todaySession?.minutesRead || 0) + additionalMinutes;

      updateSession.mutate({
        date: format(new Date(), 'yyyy-MM-dd'),
        minutesRead: newTotal,
      });

      setElapsedSeconds(remainderSeconds);
    }
  }, [elapsedSeconds, todaySession, updateSession]);

  const startTimer = useCallback(() => {
    setIsReading(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsReading(false);
    saveProgress();
  }, [saveProgress]);

  const resetTimer = useCallback(() => {
    saveProgress();
    setElapsedSeconds(0);
    setIsReading(false);
  }, [saveProgress]);

  const toggleTimer = useCallback(() => {
    if (isReading) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isReading, pauseTimer, startTimer]);

  return (
    <QuranTimerContext.Provider
      value={{
        elapsedSeconds,
        isReading,
        startTimer,
        pauseTimer,
        resetTimer,
        toggleTimer,
      }}
    >
      {children}
    </QuranTimerContext.Provider>
  );
}

export function useQuranTimer() {
  const context = useContext(QuranTimerContext);
  if (context === undefined) {
    throw new Error('useQuranTimer must be used within a QuranTimerProvider');
  }
  return context;
}
