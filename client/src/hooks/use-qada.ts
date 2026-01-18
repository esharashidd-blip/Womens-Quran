import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Qada } from "@shared/schema";

export function useQada() {
  return useQuery<Qada[]>({
    queryKey: ["/api/qada"],
  });
}

export function useUpdateQada() {
  return useMutation({
    mutationFn: async ({ prayerName, count }: { prayerName: string; count: number }) => {
      const res = await apiRequest("POST", `/api/qada/${prayerName}`, { count });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qada"] });
    },
  });
}
