import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Qada } from "@shared/schema";

export function useQada() {
  return useQuery<Qada[]>({
    queryKey: ["/api/qada"],
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useUpdateQada() {
  return useMutation({
    mutationFn: async ({ prayerName, count }: { prayerName: string; count: number }) => {
      const res = await apiRequest("POST", `/api/qada/${prayerName}`, { count });
      return res.json();
    },
    onMutate: async ({ prayerName, count }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/qada"] });
      const previousQada = queryClient.getQueryData<Qada[]>(["/api/qada"]);

      if (previousQada) {
        queryClient.setQueryData<Qada[]>(["/api/qada"], (old) => {
          if (!old) return [];
          const exists = old.find(q => q.prayerName === prayerName);
          if (exists) {
            return old.map(q => q.prayerName === prayerName ? { ...q, count } : q);
          }
          return [...old, { id: Math.random(), userId: "temp", prayerName, count }];
        });
      }

      return { previousQada };
    },
    onError: (err, variables, context) => {
      if (context?.previousQada) {
        queryClient.setQueryData(["/api/qada"], context.previousQada);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qada"] });
    },
  });
}
