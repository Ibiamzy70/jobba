import { apiFetch } from "../lib/api";
import { useMemo } from "react";
import { useAuthStore } from "../stores/auth";
import { stringify } from "qs";
import type { components } from "../types/api-schema";

type Skill = components["schemas"]["Skill"];
type SkillCreate = components["schemas"]["SkillCreate"];
type SkillUpdate = components["schemas"]["SkillUpdate"];
type PaginatedSkillList = components["schemas"]["PaginatedSkillList"];

const BASE = "/applicant/skills/";

export const skillsQueryKeys = {
  all: ["skills"] as const,
  lists: () => [...skillsQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...skillsQueryKeys.lists(), params] as const,
  detail: (id: number) => [...skillsQueryKeys.all, "detail", id] as const,
};

const skillsApi = {
  list: async (params?: Record<string, any>, token?: string, signal?: AbortSignal) => {
    try {
      const queryString = params 
        ? `?${stringify(params, { arrayFormat: "comma", encode: false, skipNulls: true })}` 
        : "";
      
      return await apiFetch<PaginatedSkillList>(
        `${BASE}${queryString}`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error("[Skills API] List failed:", err);
      throw err;
    }
  },

  create: async (payload: SkillCreate, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<Skill>(
        BASE, 
        { method: "POST", body: JSON.stringify(payload), signal }, 
        token
      );
    } catch (err) {
      console.error("[Skills API] Create failed:", err);
      throw err;
    }
  },

  remove: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<void>(
        `${BASE}${id}/`, 
        { method: "DELETE", signal }, 
        token
      );
    } catch (err) {
      console.error(`[Skills API] Delete failed for ID ${id}:`, err);
      throw err;
    }
  },
};

export const useSkillsApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      list: (params?: Record<string, any>, signal?: AbortSignal) =>
        skillsApi.list(params, token ?? undefined, signal),
      create: (payload: SkillCreate, signal?: AbortSignal) =>
        skillsApi.create(payload, token ?? undefined, signal),
      remove: (id: number, signal?: AbortSignal) =>
        skillsApi.remove(id, token ?? undefined, signal),
    }),
    [token]
  );
};