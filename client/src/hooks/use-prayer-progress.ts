import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import type { PrayerProgress } from "@shared/schema";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { "Authorization": `Bearer ${session.access_token}` };
  }
  return {};
}

export function useTodayProgress() {
  const today = format(new Date(), "yyyy-MM-dd");
  return useQuery<PrayerProgress | null>({
    queryKey: ["/api/prayer-progress", today],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/prayer-progress/${today}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch prayer progress");
      return res.json();
    },
  });
}

export function useWeeklyProgress() {
  const now = new Date();
  // Fetch last 365 days to support long streaks
  const startDate = format(subDays(now, 365), "yyyy-MM-dd");
  const endDate = format(now, "yyyy-MM-dd");

  return useQuery<PrayerProgress[]>({
    queryKey: ["/api/prayer-progress", "weekly", startDate, endDate],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/prayer-progress?startDate=${startDate}&endDate=${endDate}`, { headers });
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
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/prayer-progress?startDate=${startDate}&endDate=${endDate}`, { headers });
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
    onMutate: async ({ date, prayer, completed }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/prayer-progress", date] });

      // Snapshot the previous value
      const previousProgress = queryClient.getQueryData<PrayerProgress>(["/api/prayer-progress", date]);

      // Optimistically update to the new value
      if (previousProgress) {
        queryClient.setQueryData<PrayerProgress>(["/api/prayer-progress", date], {
          ...previousProgress,
          [prayer.toLowerCase()]: completed,
        });
      }

      return { previousProgress };
    },
    onError: (_err, { date }, context) => {
      // Roll back on error
      if (context?.previousProgress) {
        queryClient.setQueryData(["/api/prayer-progress", date], context.previousProgress);
      }
    },
    onSuccess: (data, { date }) => {
      // Update cache with actual server response data
      queryClient.setQueryData(["/api/prayer-progress", date], data);

      // Also invalidate weekly/monthly queries to ensure they are updated
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "/api/prayer-progress" && (key[1] === "weekly" || key[1] === "monthly");
        }
      });
    },
    onSettled: (_data, _error, { date }) => {
      // Force refetch the specific date to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-progress", date] });
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
