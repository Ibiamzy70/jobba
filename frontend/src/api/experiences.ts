import { apiFetch } from "../lib/api";
import { useMemo } from "react";
import { useAuthStore } from "../stores/auth";
import { stringify } from "qs";
import type { components } from "../types/api-schema";

type Experience = components["schemas"]["Experience"];
type ExperienceCreate = components["schemas"]["ExperienceCreate"];
type ExperienceUpdate = components["schemas"]["ExperienceUpdate"];
type PaginatedExperienceList = components["schemas"]["PaginatedExperienceList"];

const BASE = "/applicant/experiences/";

export const experiencesQueryKeys = {
  all: ["experiences"] as const,
  lists: () => [...experiencesQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...experiencesQueryKeys.lists(), params] as const,
  detail: (id: number) => [...experiencesQueryKeys.all, "detail", id] as const,
};


const experiencesApi = {
  list: async (params?: Record<string, any>, token?: string, signal?: AbortSignal) => {
    try {
      const queryString = params 
        ? `?${stringify(params, { arrayFormat: "comma", encode: false, skipNulls: true })}` 
        : "";
      
      return await apiFetch<PaginatedExperienceList>(
        `${BASE}${queryString}`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error("[Experiences API] List failed:", err);
      // Optional: Send to monitoring service (Sentry, LogRocket, etc.)
      // captureException(err, { tags: { api: "experiences", method: "list" } });
      throw err;
    }
  },

  get: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<Experience>(
        `${BASE}${id}/`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error(`[Experiences API] Get failed for ID ${id}:`, err);
      throw err;
    }
  },

  create: async (payload: ExperienceCreate, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<Experience>(
        BASE, 
        { 
          method: "POST", 
          body: JSON.stringify(payload),
          signal 
        }, 
        token
      );
    } catch (err) {
      console.error("[Experiences API] Create failed:", err);
      
      throw err;
    }
  },

  update: async (id: number, payload: ExperienceUpdate, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<Experience>(
        `${BASE}${id}/`, 
        { 
          method: "PATCH", 
          body: JSON.stringify(payload),
          signal 
        }, 
        token
      );
    } catch (err) {
      console.error(`[Experiences API] Update failed for ID ${id}:`, err);
      throw err;
    }
  },

  remove: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<void>(
        `${BASE}${id}/`, 
        { 
          method: "DELETE",
          signal 
        }, 
        token
      );
    } catch (err) {
      console.error(`[Experiences API] Delete failed for ID ${id}:`, err);
      throw err;
    }
  },
};

export const useExperiencesApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      list: (params?: Record<string, any>, signal?: AbortSignal) => 
        experiencesApi.list(params, token ?? undefined, signal),
      
      get: (id: number, signal?: AbortSignal) => 
        experiencesApi.get(id, token ?? undefined, signal),
      
      create: (payload: ExperienceCreate, signal?: AbortSignal) => 
        experiencesApi.create(payload, token ?? undefined, signal),
      
      update: (id: number, payload: ExperienceUpdate, signal?: AbortSignal) => 
        experiencesApi.update(id, payload, token ?? undefined, signal),
      
      remove: (id: number, signal?: AbortSignal) => 
        experiencesApi.remove(id, token ?? undefined, signal),
    }),
    [token]
  );
};