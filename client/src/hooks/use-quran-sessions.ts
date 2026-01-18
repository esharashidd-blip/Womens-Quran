import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { QuranReadingSession } from "@shared/schema";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export function useTodayQuranSession() {
  return useQuery<QuranReadingSession | null>({
    queryKey: ["/api/quran-sessions/today"],
  });
}

export function useWeeklyQuranSessions() {
  const now = new Date();
  const startDate = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const endDate = format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
  
  return useQuery<QuranReadingSession[]>({
    queryKey: ["/api/quran-sessions", "weekly", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/quran-sessions?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch weekly sessions");
      return res.json();
    },
  });
}

export function useMonthlyQuranSessions() {
  const now = new Date();
  const startDate = format(startOfMonth(now), "yyyy-MM-dd");
  const endDate = format(endOfMonth(now), "yyyy-MM-dd");
  
  return useQuery<QuranReadingSession[]>({
    queryKey: ["/api/quran-sessions", "monthly", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/quran-sessions?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch monthly sessions");
      return res.json();
    },
  });
}

export function useUpdateQuranSession() {
  return useMutation({
    mutationFn: async (data: { date: string; minutesRead: number; lastSurahNumber?: number; lastAyahNumber?: number }) => {
      const res = await apiRequest("POST", "/api/quran-sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && typeof key[0] === 'string' && key[0].includes("quran-sessions");
        }
      });
    },
  });
}

export function calculateWeeklyMinutes(sessions: QuranReadingSession[]) {
  return sessions.reduce((sum, s) => sum + (s.minutesRead || 0), 0);
}
