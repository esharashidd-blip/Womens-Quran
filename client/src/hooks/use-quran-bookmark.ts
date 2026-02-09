import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { QuranBookmark } from "@shared/schema";

export function useQuranBookmark() {
  return useQuery<QuranBookmark | null>({
    queryKey: ["/api/quran-bookmark"],
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/quran-bookmark");
      return res.json();
    },
  });
}

export function useSetQuranBookmark() {
  return useMutation({
    mutationFn: async ({
      surahNumber,
      ayahNumber,
      surahName,
    }: {
      surahNumber: number;
      ayahNumber: number;
      surahName: string;
    }) => {
      const res = await apiRequest("POST", "/api/quran-bookmark", {
        surahNumber,
        ayahNumber,
        surahName,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/quran-bookmark"], data);
    },
  });
}
