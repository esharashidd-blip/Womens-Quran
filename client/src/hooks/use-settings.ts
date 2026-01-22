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
    onMutate: async (updates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/settings"] });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<Settings>(["/api/settings"]);

      // Optimistically update to the new value
      if (previousSettings) {
        queryClient.setQueryData<Settings>(["/api/settings"], {
          ...previousSettings,
          ...updates,
        });
      }

      return { previousSettings };
    },
    onError: (_err, _updates, context) => {
      // Roll back on error
      if (context?.previousSettings) {
        queryClient.setQueryData(["/api/settings"], context.previousSettings);
      }
    },
    onSuccess: (data) => {
      // Update cache with actual server response data
      queryClient.setQueryData<Settings>(["/api/settings"], data);
    },
    onSettled: () => {
      // Force refetch to ensure consistency
      queryClient.refetchQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (key[0] === "prayer-times" || key[0] === "prayer-times-coords");
        }
      });
    },
  });
}
