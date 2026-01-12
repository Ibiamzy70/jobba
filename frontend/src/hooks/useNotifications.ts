import { useQuery, useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { useNotificationsApi, notificationsQueryKeys } from "../api/notifications";
import type { components } from "../types/api-schema";

type Notification = components["schemas"]["Notification"];
type PaginatedNotificationList = components["schemas"]["PaginatedNotificationList"];

const handleMutationError = (error: unknown) => {
  console.error("[Notifications Mutation Error]", error);
};

type RollbackContext = {
  previousLists: [QueryKey, PaginatedNotificationList | undefined][]; 
  previousCount: { unread: number } | undefined;
};

export const useNotifications = (params?: Record<string, any>) => {
  const api = useNotificationsApi();
  
  return useQuery<PaginatedNotificationList>({
    queryKey: notificationsQueryKeys.list(params),
    queryFn: ({ signal }) => api.list(params, signal),
    staleTime: 1000 * 60 * 5,
  });
};

export const useNotification = (id?: number) => {
  const api = useNotificationsApi();
  
  return useQuery<Notification>({
    queryKey: notificationsQueryKeys.detail(id!),
    queryFn: ({ signal }) => api.get(id!, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useUnreadCount = () => {
  const api = useNotificationsApi();
  
  return useQuery<{ unread: number }>({
    queryKey: notificationsQueryKeys.count(),
    queryFn: ({ signal }) => api.count(signal),
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 60,
    initialData: { unread: 0 },
  });
};

export const useMarkNotificationRead = () => {
  const api = useNotificationsApi();
  const qc = useQueryClient();
  
  return useMutation<Notification, unknown, number, RollbackContext>({
    mutationFn: api.markRead,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationsQueryKeys.lists() });
      await qc.cancelQueries({ queryKey: notificationsQueryKeys.count() });

    
      const previousLists = qc.getQueriesData<PaginatedNotificationList>({
        queryKey: notificationsQueryKeys.lists(),
      }) as [QueryKey, PaginatedNotificationList | undefined][];

      const previousCount = qc.getQueryData<{ unread: number }>(
        notificationsQueryKeys.count()
      );

      qc.setQueriesData<PaginatedNotificationList>(
        { queryKey: notificationsQueryKeys.lists() },
        (old) => old ? {
          ...old,
          results: old.results.map(n => 
            n.id === id ? { ...n, is_read: true } : n
          ),
        } : old
      );

      qc.setQueryData<{ unread: number }>(
        notificationsQueryKeys.count(),
        (old) => ({ unread: Math.max(0, (old?.unread ?? 0) - 1) })
      );

      return { previousLists, previousCount };
    },
    onSuccess: (data, id) => {
      qc.setQueryData(notificationsQueryKeys.detail(id), data);
    },
    onError: (err, _id, context) => {
      
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
      if (context?.previousCount !== undefined) {
        qc.setQueryData(notificationsQueryKeys.count(), context.previousCount);
      }
      handleMutationError(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationsQueryKeys.lists() });
      qc.invalidateQueries({ queryKey: notificationsQueryKeys.count() });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const api = useNotificationsApi();
  const qc = useQueryClient();
  
  return useMutation<void, unknown, void, RollbackContext>({
    mutationFn: () => api.markAllRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationsQueryKeys.lists() });
      await qc.cancelQueries({ queryKey: notificationsQueryKeys.count() });

      
      const previousLists = qc.getQueriesData<PaginatedNotificationList>({
        queryKey: notificationsQueryKeys.lists(),
      }) as [QueryKey, PaginatedNotificationList | undefined][];

      const previousCount = qc.getQueryData<{ unread: number }>(
        notificationsQueryKeys.count()
      );

      qc.setQueriesData<PaginatedNotificationList>(
        { queryKey: notificationsQueryKeys.lists() },
        (old) => old ? {
          ...old,
          results: old.results.map(n => ({ ...n, is_read: true })),
        } : old
      );

      qc.setQueryData<{ unread: number }>(
        notificationsQueryKeys.count(),
        { unread: 0 }
      );

      return { previousLists, previousCount };
    },
    onError: (err, _, context) => {
      
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
      if (context?.previousCount !== undefined) {
        qc.setQueryData(notificationsQueryKeys.count(), context.previousCount);
      }
      handleMutationError(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationsQueryKeys.lists() });
      qc.invalidateQueries({ queryKey: notificationsQueryKeys.count() });
    },
  });
};

export const useNotificationActions = () => {
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return { markRead, markAllRead };
};