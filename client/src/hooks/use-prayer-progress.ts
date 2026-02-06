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
      // Cancel any outgoing refetches for this specific date
      await queryClient.cancelQueries({ queryKey: [`/api/prayer-progress/${date}`] });

      // Snapshot the previous value for rollback
      const previousProgress = queryClient.getQueryData<PrayerProgress | null>([`/api/prayer-progress/${date}`]);

      // Optimistically update the cache with the new value
      queryClient.setQueryData<PrayerProgress | null>([`/api/prayer-progress/${date}`], (old) => {
        if (!old) {
          // Create new progress entry if it doesn't exist
          return {
            id: 0,
            userId: null,
            date,
            fajr: prayer === 'fajr' ? completed : false,
            dhuhr: prayer === 'dhuhr' ? completed : false,
            asr: prayer === 'asr' ? completed : false,
            maghrib: prayer === 'maghrib' ? completed : false,
            isha: prayer === 'isha' ? completed : false,
          } as PrayerProgress;
        }
        // Update existing entry
        return {
          ...old,
          [prayer]: completed,
        };
      });

      return { previousProgress, date };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousProgress !== undefined) {
        queryClient.setQueryData([`/api/prayer-progress/${context.date}`], context.previousProgress);
      }
    },
    onSettled: (data, error, variables) => {
      // Only invalidate the specific date's query
      queryClient.invalidateQueries({ queryKey: [`/api/prayer-progress/${variables.date}`] });

      // Also invalidate weekly/monthly queries since they might include this date
      const now = new Date();
      const startDate = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
      const endDate = format(endOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
      queryClient.invalidateQueries({ queryKey: [`/api/prayer-progress?startDate=${startDate}&endDate=${endDate}`] });

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
