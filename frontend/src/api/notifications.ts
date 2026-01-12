import { apiFetch } from "../lib/api";
import { useMemo } from "react";
import { useAuthStore } from "../stores/auth";
import { stringify } from "qs";
import type { components } from "../types/api-schema";

type Notification = components["schemas"]["Notification"];
type PaginatedNotificationList = components["schemas"]["PaginatedNotificationList"];

const BASE = "/notifications/";

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationsQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...notificationsQueryKeys.lists(), params] as const,
  detail: (id: number) => [...notificationsQueryKeys.all, "detail", id] as const,
  count: () => [...notificationsQueryKeys.all, "count"] as const,
};

const notificationsApi = {
  list: async (params?: Record<string, any>, token?: string, signal?: AbortSignal) => {
    try {
      const queryString = params 
        ? `?${stringify(params, { arrayFormat: "comma", encode: false, skipNulls: true })}` 
        : "";
      
      return await apiFetch<PaginatedNotificationList>(
        `${BASE}${queryString}`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error("[Notifications API] List failed:", err);
      throw err;
    }
  },

  get: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<Notification>(
        `${BASE}${id}/`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error(`[Notifications API] Get failed for ID ${id}:`, err);
      throw err;
    }
  },

  markRead: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<Notification>(
        `${BASE}${id}/mark_read/`, 
        { method: "POST", signal }, 
        token
      );
    } catch (err) {
      console.error(`[Notifications API] Mark read failed for ID ${id}:`, err);
      throw err;
    }
  },

  markAllRead: async (token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<void>(
        `${BASE}mark_all_read/`, 
        { method: "POST", signal }, 
        token
      );
    } catch (err) {
      console.error("[Notifications API] Mark all read failed:", err);
      throw err;
    }
  },

  count: async (token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<{ unread: number }>(
        `${BASE}count/`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error("[Notifications API] Count failed:", err);
      // Return fallback value instead of throwing
      return { unread: 0 };
    }
  },
};

export const useNotificationsApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      list: (params?: Record<string, any>, signal?: AbortSignal) =>
        notificationsApi.list(params, token ?? undefined, signal),
      get: (id: number, signal?: AbortSignal) =>
        notificationsApi.get(id, token ?? undefined, signal),
      markRead: (id: number, signal?: AbortSignal) =>
        notificationsApi.markRead(id, token ?? undefined, signal),
      markAllRead: (signal?: AbortSignal) =>
        notificationsApi.markAllRead(token ?? undefined, signal),
      count: (signal?: AbortSignal) =>
        notificationsApi.count(token ?? undefined, signal),
    }),
    [token]
  );
};