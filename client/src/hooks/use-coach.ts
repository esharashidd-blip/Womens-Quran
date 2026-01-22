import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

export interface CoachConversation {
  id: number;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CoachMessage {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  tokensUsed: number | null;
  createdAt: string;
}

export interface TokenUsage {
  used: number;
  remaining: number;
  dailyLimit: number;
  allowed: boolean;
}

export function useConversations() {
  return useQuery<CoachConversation[]>({
    queryKey: ["/api/coach/conversations"],
    queryFn: getQueryFn<CoachConversation[]>({ on401: "throw" }),
  });
}

export function useMessages(conversationId: number | null) {
  return useQuery<CoachMessage[]>({
    queryKey: [`/api/coach/conversations/${conversationId}/messages`],
    enabled: conversationId !== null,
    queryFn: getQueryFn<CoachMessage[]>({ on401: "throw" }),
  });
}

export function useTokenUsage() {
  return useQuery<TokenUsage>({
    queryKey: ["/api/coach/token-usage"],
    queryFn: getQueryFn<TokenUsage>({ on401: "throw" }),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/coach/conversations");
      return res.json() as Promise<CoachConversation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/conversations"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: number;
      content: string;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/coach/conversations/${conversationId}/messages`,
        { content }
      );
      return res.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [`/api/coach/conversations/${variables.conversationId}/messages`],
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<CoachMessage[]>(
        [`/api/coach/conversations/${variables.conversationId}/messages`]
      );

      // Optimistically add the user message
      const optimisticMessage: CoachMessage = {
        id: Date.now(), // Temporary ID
        conversationId: variables.conversationId,
        role: "user",
        content: variables.content,
        tokensUsed: 0,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<CoachMessage[]>(
        [`/api/coach/conversations/${variables.conversationId}/messages`],
        (old) => [...(old || []), optimisticMessage]
      );

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          [`/api/coach/conversations/${variables.conversationId}/messages`],
          context.previousMessages
        );
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/coach/conversations/${variables.conversationId}/messages`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/token-usage"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: number) => {
      await apiRequest("DELETE", `/api/coach/conversations/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/conversations"] });
    },
  });
}
