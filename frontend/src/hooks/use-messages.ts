import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessagesApi, messagesQueryKeys } from "../api/messages";
import type { components } from "../types/api-schema";

type Message = components["schemas"]["Message"];
type PaginatedMessageList = components["schemas"]["PaginatedMessageList"];

const handleMutationError = (error: unknown) => {
  console.error("[Messages Mutation Error]", error);
  // Optional: toast.error("Failed to mark message as read.");
};

export const useMessages = (params?: Record<string, any>) => {
  const api = useMessagesApi();
  
  return useQuery<PaginatedMessageList>({
    queryKey: messagesQueryKeys.list(params),
    queryFn: ({ signal }) => api.list(params, signal),
    enabled: !!params?.profile,
    staleTime: 1000 * 60 * 2, 
  });
};

export const useMessage = (id?: number) => {
  const api = useMessagesApi();
  
  return useQuery<Message>({
    queryKey: messagesQueryKeys.detail(id!),
    queryFn: ({ signal }) => api.get(id!, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useMarkMessageRead = () => {
  const api = useMessagesApi();
  const qc = useQueryClient();
  
  return useMutation<Message, unknown, number>({
    mutationFn: (id) => api.markRead(id),
    onSuccess: (data, id) => {
      // Update the specific message in cache
      qc.setQueryData(messagesQueryKeys.detail(id), data);
      // Refresh the list to show updated read status
      qc.invalidateQueries({ queryKey: messagesQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};