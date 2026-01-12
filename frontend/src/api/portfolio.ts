import { apiFetch } from "../lib/api";
import { useMemo } from "react";
import { useAuthStore } from "../stores/auth";
import { stringify } from "qs";
import type { components } from "../types/api-schema";

type PortfolioItem = components["schemas"]["PortfolioItem"];
type PaginatedPortfolioItemList = components["schemas"]["PaginatedPortfolioItemList"];

const BASE = "/applicant/portfolio/"; 

export const portfolioQueryKeys = {
  all: ["portfolio"] as const,
  lists: () => [...portfolioQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...portfolioQueryKeys.lists(), params] as const,
  detail: (id: number) => [...portfolioQueryKeys.all, "detail", id] as const,
};

const portfolioApi = {
  list: async (params?: Record<string, any>, token?: string, signal?: AbortSignal) => {
    const queryString = params
      ? `?${stringify(params, { arrayFormat: "comma", encode: false, skipNulls: true })}`
      : "";
    return await apiFetch<PaginatedPortfolioItemList>(
      `${BASE}${queryString}`,
      { signal },
      token
    );
  },

  get: async (id: number, token?: string, signal?: AbortSignal) => {
    return await apiFetch<PortfolioItem>(`${BASE}${id}/`, { signal }, token);
  },

  create: async (payload: FormData, token?: string, signal?: AbortSignal) => {
    return await apiFetch<PortfolioItem>(BASE, { method: "POST", body: payload, signal }, token);
  },

  update: async (id: number, payload: FormData, token?: string, signal?: AbortSignal) => {
    return await apiFetch<PortfolioItem>(
      `${BASE}${id}/`,
      { method: "PATCH", body: payload, signal },
      token
    );
  },

  remove: async (id: number, token?: string, signal?: AbortSignal) => {
    return await apiFetch<void>(`${BASE}${id}/`, { method: "DELETE", signal }, token);
  },
};

export const usePortfolioApi = () => {
  const token = useAuthStore((s) => s.token);
  return useMemo(() => ({
    list: (params?: Record<string, any>, signal?: AbortSignal) => portfolioApi.list(params, token ?? undefined, signal),
    get: (id: number, signal?: AbortSignal) => portfolioApi.get(id, token ?? undefined, signal),
    create: (payload: FormData, signal?: AbortSignal) => portfolioApi.create(payload, token ?? undefined, signal),
    update: (id: number, payload: FormData, signal?: AbortSignal) => portfolioApi.update(id, payload, token ?? undefined, signal),
    remove: (id: number, signal?: AbortSignal) => portfolioApi.remove(id, token ?? undefined, signal),
  }), [token]);
};