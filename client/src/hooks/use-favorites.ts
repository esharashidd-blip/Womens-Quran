import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertFavorite } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.favorites.list.path);
      return api.favorites.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (favorite: InsertFavorite) => {
      console.log('🔵 Attempting to save favorite:', favorite);
      try {
        const res = await apiRequest(
          api.favorites.create.method,
          api.favorites.create.path,
          favorite
        );
        console.log('✅ Favorite saved successfully');
        return api.favorites.create.responses[201].parse(await res.json());
      } catch (error) {
        console.error('❌ Failed to save favorite:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
      toast({
        title: "Saved to Favorites",
        description: "This verse has been added to your collection.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Favorite mutation error:', error);
      const errorMessage = error?.message || error?.toString() || "Could not save favorite";
      toast({
        title: "Error",
        description: errorMessage + ". Make sure you're signed in.",
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
      await apiRequest(api.favorites.delete.method, url);
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
