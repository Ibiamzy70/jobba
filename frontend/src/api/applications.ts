import { apiFetch } from "../lib/api";
import type { components } from "../types/api-schema";
import { stringify } from "qs";

type Application = components["schemas"]["Application"];
type ApplicationCreate = components["schemas"]["ApplicationCreate"];
type ApplicationUpdate = components["schemas"]["ApplicationUpdate"];
type PaginatedApplicationList = components["schemas"]["PaginatedApplicationList"];

const BASE = "/applications/";

const stableStringify = (obj?: Record<string, any>) =>
  obj ? stringify(obj, { arrayFormat: "comma", encode: false, skipNulls: true }) : "";

export const applicationsQueryKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationsQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) =>
    [...applicationsQueryKeys.lists(), stableStringify(params)] as const,
  details: () => [...applicationsQueryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...applicationsQueryKeys.details(), id] as const,
};

export const applicationsApi = {
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
    return apiFetch<PaginatedApplicationList>(`${BASE}${qs}`, { method: "GET" }, token);
  },

  get: (id: string | number, token?: string) =>
    apiFetch<Application>(`${BASE}${id}/`, { method: "GET" }, token),

  create: (payload: ApplicationCreate | FormData, token?: string) =>
    apiFetch<Application>(`${BASE}create/`, {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }, token),

  update: (id: string | number, payload: ApplicationUpdate | FormData, token?: string) =>
    apiFetch<Application>(`${BASE}${id}/`, {
      method: "PATCH",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }, token),

  remove: (id: string | number, token?: string) =>
    apiFetch<void>(`${BASE}${id}/`, { method: "DELETE" }, token),
};


import { useAuthStore } from "../stores/auth";
import { useMemo } from "react";

export const useApplicationsApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      list: (params?: any) => applicationsApi.list(params, token ?? undefined),
      get: (id: string | number) => applicationsApi.get(id, token ?? undefined),
      create: (payload: ApplicationCreate | FormData) =>
        applicationsApi.create(payload, token ?? undefined),
      update: (id: string | number, payload: ApplicationUpdate | FormData) =>
        applicationsApi.update(id, payload, token ?? undefined),
      remove: (id: string | number) => applicationsApi.remove(id, token ?? undefined),
    }),
    [token]
  );
};
