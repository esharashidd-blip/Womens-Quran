import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import type { PrayerProgress } from "@shared/schema";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export function useTodayProgress() {
  const today = format(new Date(), "yyyy-MM-dd");
  return useQuery<PrayerProgress | null>({
    queryKey: [`/api/prayer-progress/${today}`],
    queryFn: getQueryFn<PrayerProgress | null>({ on401: "returnNull" }),
  });
}

export function useWeeklyProgress() {
  const now = new Date();
  const startDate = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const endDate = format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");

  return useQuery<PrayerProgress[]>({
    queryKey: [`/api/prayer-progress?startDate=${startDate}&endDate=${endDate}`],
    queryFn: getQueryFn<PrayerProgress[]>({ on401: "returnNull" }),
  });
}

export function useMonthlyProgress() {
  const now = new Date();
  const startDate = format(startOfMonth(now), "yyyy-MM-dd");
  const endDate = format(endOfMonth(now), "yyyy-MM-dd");

  return useQuery<PrayerProgress[]>({
    queryKey: [`/api/prayer-progress?startDate=${startDate}&endDate=${endDate}`],
    queryFn: getQueryFn<PrayerProgress[]>({ on401: "returnNull" }),
  });
}

export function useUpdatePrayerProgress() {
  return useMutation({
    mutationFn: async ({ date, prayer, completed }: { date: string; prayer: string; completed: boolean }) => {
      const res = await apiRequest("POST", `/api/prayer-progress/${date}`, { prayer, completed });
      return res.json();
    },
    onMutate: async ({ date, prayer, completed }) => {
      const now = new Date();
      const weekStart = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
      const weeklyKey = [`/api/prayer-progress?startDate=${weekStart}&endDate=${weekEnd}`];
      const monthlyKey = [`/api/prayer-progress?startDate=${monthStart}&endDate=${monthEnd}`];

      // Cancel all related refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [`/api/prayer-progress/${date}`] }),
        queryClient.cancelQueries({ queryKey: weeklyKey }),
        queryClient.cancelQueries({ queryKey: monthlyKey }),
      ]);

      // Snapshot previous values for rollback
      const previousProgress = queryClient.getQueryData<PrayerProgress | null>([`/api/prayer-progress/${date}`]);
      const previousWeekly = queryClient.getQueryData<PrayerProgress[]>(weeklyKey);
      const previousMonthly = queryClient.getQueryData<PrayerProgress[]>(monthlyKey);

      // Helper to update a single day's progress
      const updateDay = (old: PrayerProgress | null | undefined): PrayerProgress => {
        if (!old) {
          return {
            id: 0, userId: null, date,
            fajr: prayer === 'fajr' ? completed : false,
            dhuhr: prayer === 'dhuhr' ? completed : false,
            asr: prayer === 'asr' ? completed : false,
            maghrib: prayer === 'maghrib' ? completed : false,
            isha: prayer === 'isha' ? completed : false,
          } as PrayerProgress;
        }
        return { ...old, [prayer]: completed };
      };

      // Optimistically update the daily cache
      queryClient.setQueryData<PrayerProgress | null>([`/api/prayer-progress/${date}`], updateDay);

      // Helper to update a progress array in-place
      const updateProgressArray = (old: PrayerProgress[] | undefined): PrayerProgress[] => {
        if (!old) return [];
        const idx = old.findIndex(p => p.date === date);
        if (idx >= 0) {
          const updated = [...old];
          updated[idx] = updateDay(updated[idx]);
          return updated;
        }
        return [...old, updateDay(null)];
      };

      // Optimistically update weekly and monthly caches too (prevents flicker)
      queryClient.setQueryData<PrayerProgress[]>(weeklyKey, updateProgressArray);
      queryClient.setQueryData<PrayerProgress[]>(monthlyKey, updateProgressArray);

      return { previousProgress, previousWeekly, previousMonthly, date, weeklyKey, monthlyKey };
    },
    onError: (err, variables, context) => {
      if (!context) return;
      queryClient.setQueryData([`/api/prayer-progress/${context.date}`], context.previousProgress);
      if (context.previousWeekly !== undefined) {
        queryClient.setQueryData(context.weeklyKey, context.previousWeekly);
      }
      if (context.previousMonthly !== undefined) {
        queryClient.setQueryData(context.monthlyKey, context.previousMonthly);
      }
    },
    onSettled: (data, error, variables) => {
      // Silently refetch in background — UI already shows optimistic data
      queryClient.invalidateQueries({ queryKey: [`/api/prayer-progress/${variables.date}`] });

      const now = new Date();
      const weekStart = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
      const weekEnd = format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
      queryClient.invalidateQueries({ queryKey: [`/api/prayer-progress?startDate=${weekStart}&endDate=${weekEnd}`] });

      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
      queryClient.invalidateQueries({ queryKey: [`/api/prayer-progress?startDate=${monthStart}&endDate=${monthEnd}`] });
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
