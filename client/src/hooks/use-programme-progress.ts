import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ProgrammeProgress } from "@shared/schema";

export function useAllProgrammeProgress() {
    return useQuery<ProgrammeProgress[]>({
        queryKey: ["/api/programme-progress"],
        staleTime: Infinity,
        gcTime: Infinity,
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/programme-progress");
            return res.json();
        }
    });
}

export function useProgrammeProgress(programmeId: string | null) {
    return useQuery<ProgrammeProgress>({
        queryKey: ["/api/programme-progress", programmeId],
        enabled: !!programmeId,
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/programme-progress/${programmeId}`);
            return res.json();
        }
    });
}

export function useUpdateProgrammeProgress() {
    return useMutation({
        mutationFn: async ({ programmeId, updates }: { programmeId: string, updates: Partial<ProgrammeProgress> }) => {
            const res = await apiRequest("POST", `/api/programme-progress/${programmeId}`, updates);
            return res.json();
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(["/api/programme-progress", variables.programmeId], data);
            queryClient.invalidateQueries({ queryKey: ["/api/programme-progress"] });
        },
    });
}
