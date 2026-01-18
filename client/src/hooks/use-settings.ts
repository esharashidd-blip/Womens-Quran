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
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<Settings>(["/api/settings"], (old) => {
        if (!old) return old;
        return { ...old, ...variables };
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (key[0] === "prayer-times" || key[0] === "prayer-times-coords");
        }
      });
    },
  });
}
