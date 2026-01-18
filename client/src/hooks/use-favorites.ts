import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertFavorite } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await fetch(api.favorites.list.path);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return api.favorites.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (favorite: InsertFavorite) => {
      const res = await fetch(api.favorites.create.path, {
        method: api.favorites.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(favorite),
      });
      
      if (!res.ok) {
        throw new Error("Failed to add favorite");
      }
      return api.favorites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
      toast({
        title: "Saved to Favorites",
        description: "This verse has been added to your collection.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not save favorite. Please try again.",
        variant: "destructive",
      });
    }
  });
}

export function useDeleteFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.favorites.delete.path, { id });
      const res = await fetch(url, {
        method: api.favorites.delete.method,
      });
      
      if (!res.ok) throw new Error("Failed to remove favorite");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
      toast({
        title: "Removed",
        description: "Verse removed from favorites.",
      });
    },
  });
}
