import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ["/api/settings"],
  });
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const res = await apiRequest("POST", "/api/settings", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });
}
