import { apiFetch } from "../lib/api";
import { useMemo } from "react";
import { useAuthStore } from "../stores/auth";
import { stringify } from "qs";
import type { components } from "../types/api-schema";

type Message = components["schemas"]["Message"];
type PaginatedMessageList = components["schemas"]["PaginatedMessageList"];

const BASE = "/messages/";

export const messagesQueryKeys = {
  all: ["messages"] as const,
  lists: () => [...messagesQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...messagesQueryKeys.lists(), params] as const,
  detail: (id: number) => [...messagesQueryKeys.all, "detail", id] as const,
};

const messagesApi = {
  list: async (params?: Record<string, any>, token?: string, signal?: AbortSignal) => {
    try {
      const queryString = params 
        ? `?${stringify(params, { arrayFormat: "comma", encode: false, skipNulls: true })}` 
        : "";
      
      return await apiFetch<PaginatedMessageList>(
        `${BASE}${queryString}`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error("[Messages API] List failed:", err);
      throw err;
    }
  },

  get: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<Message>(
        `${BASE}${id}/`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error(`[Messages API] Get failed for ID ${id}:`, err);
      throw err;
    }
  },

  markRead: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<Message>(
        `${BASE}${id}/mark_read/`, 
        { method: "POST", signal }, 
        token
      );
    } catch (err) {
      console.error(`[Messages API] Mark read failed for ID ${id}:`, err);
      throw err;
    }
  },
};

export const useMessagesApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      list: (params?: Record<string, any>, signal?: AbortSignal) =>
        messagesApi.list(params, token ?? undefined, signal),
      get: (id: number, signal?: AbortSignal) =>
        messagesApi.get(id, token ?? undefined, signal),
      markRead: (id: number, signal?: AbortSignal) =>
        messagesApi.markRead(id, token ?? undefined, signal),
    }),
    [token]
  );
};