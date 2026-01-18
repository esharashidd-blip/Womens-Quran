import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { PrayerProgress } from "@shared/schema";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export function useTodayProgress() {
  const today = format(new Date(), "yyyy-MM-dd");
  return useQuery<PrayerProgress | null>({
    queryKey: ["/api/prayer-progress", today],
    queryFn: async () => {
      const res = await fetch(`/api/prayer-progress/${today}`);
      if (!res.ok) throw new Error("Failed to fetch prayer progress");
      return res.json();
    },
  });
}

export function useWeeklyProgress() {
  const now = new Date();
  const startDate = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const endDate = format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
  
  return useQuery<PrayerProgress[]>({
    queryKey: ["/api/prayer-progress", "weekly", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/prayer-progress?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch weekly progress");
      return res.json();
    },
  });
}

export function useMonthlyProgress() {
  const now = new Date();
  const startDate = format(startOfMonth(now), "yyyy-MM-dd");
  const endDate = format(endOfMonth(now), "yyyy-MM-dd");
  
  return useQuery<PrayerProgress[]>({
    queryKey: ["/api/prayer-progress", "monthly", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/prayer-progress?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch monthly progress");
      return res.json();
    },
  });
}

export function useUpdatePrayerProgress() {
  return useMutation({
    mutationFn: async ({ date, prayer, completed }: { date: string; prayer: string; completed: boolean }) => {
      const res = await apiRequest("POST", `/api/prayer-progress/${date}`, { prayer, completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && typeof key[0] === 'string' && key[0].includes("prayer-progress");
        }
      });
    },
  });
}

export function calculateWeeklyStats(progress: PrayerProgress[]) {
  const totalPrayers = 7 * 5; // 7 days * 5 prayers
  let completedPrayers = 0;
  
  progress.forEach(day => {
    if (day.fajr) completedPrayers++;
    if (day.dhuhr) completedPrayers++;
    if (day.asr) completedPrayers++;
    if (day.maghrib) completedPrayers++;
    if (day.isha) completedPrayers++;
  });
  
  return {
    completed: completedPrayers,
    total: totalPrayers,
    percentage: Math.round((completedPrayers / totalPrayers) * 100),
  };
}

export function calculateMonthlyStats(progress: PrayerProgress[], daysInMonth: number) {
  const totalPrayers = daysInMonth * 5;
  let completedPrayers = 0;
  
  progress.forEach(day => {
    if (day.fajr) completedPrayers++;
    if (day.dhuhr) completedPrayers++;
    if (day.asr) completedPrayers++;
    if (day.maghrib) completedPrayers++;
    if (day.isha) completedPrayers++;
  });
  
  return {
    completed: completedPrayers,
    total: totalPrayers,
    percentage: Math.round((completedPrayers / totalPrayers) * 100),
  };
}
