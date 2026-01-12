import { apiFetch } from "../lib/api";
import type { components } from "../types/api-schema"; 
import { stringify } from "qs";

type Job = components["schemas"]["Job"];
type JobCreate = components["schemas"]["JobCreate"];
type JobUpdate = components["schemas"]["JobUpdate"];
type PaginatedJobList = components["schemas"]["PaginatedJobList"];

const BASE = "/jobs/";
const stableStringify = (obj?: Record<string, any>) =>
  obj ? stringify(obj, { arrayFormat: "comma", encode: false, skipNulls: true }) : "";

export const jobsQueryKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobsQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) =>
    [...jobsQueryKeys.lists(), stableStringify(params)] as const,
  details: () => [...jobsQueryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...jobsQueryKeys.details(), id] as const,
};

export const jobsApi = {
  list: async (
    searchParams?: URLSearchParams | Record<string, any>,
    token?: string
  ) => {
    const params =
      searchParams instanceof URLSearchParams
        ? searchParams.toString()
        : searchParams
          ? new URLSearchParams(searchParams).toString()
          : "";
    const qs = params ? `?${params}` : "";
    return apiFetch<PaginatedJobList>(`${BASE}${qs}`, { method: "GET" }, token);
  },

  

  get: (id: string | number, token?: string) =>
    apiFetch<Job>(`${BASE}${id}/`, { method: "GET" }, token),

  create: (payload: JobCreate | FormData, token?: string) =>
    apiFetch<Job>(BASE, {
      method: "POST",
      // Let apiFetch handle Content-Type automatically
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }, token),

  update: (id: string | number, payload: JobUpdate | FormData, token?: string) =>
    apiFetch<Job>(`${BASE}${id}/`, {
      method: "PATCH",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }, token),

  remove: (id: string | number, token?: string) =>
    apiFetch<void>(`${BASE}${id}/`, { method: "DELETE" }, token),
};

// Memoized hook — prevents unnecessary re-renders
import { useAuthStore } from "../stores/auth";
import { useMemo } from "react";

export const useJobsApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      list: (params?: any) => jobsApi.list(params, token ?? undefined),
      get: (id: string | number) => jobsApi.get(id, token ?? undefined),
      create: (payload: JobCreate | FormData) =>
        jobsApi.create(payload, token ?? undefined),
      update: (id: string | number, payload: JobUpdate | FormData) =>
        jobsApi.update(id, payload, token ?? undefined),
      remove: (id: string | number) => jobsApi.remove(id, token ?? undefined),
    }),
    [token]
  );
};