import { apiFetch } from "../lib/api";
import { useMemo } from "react";
import { useAuthStore } from "../stores/auth";
import { stringify } from "qs";
import type { components } from "../types/api-schema";

type JobOffer = components["schemas"]["JobOffer"];
type PaginatedJobOfferList = components["schemas"]["PaginatedJobOfferList"];

const BASE = "/job-offers/";

export const jobOffersQueryKeys = {
  all: ["job-offers"] as const,
  lists: () => [...jobOffersQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...jobOffersQueryKeys.lists(), params] as const,
  detail: (id: number) => [...jobOffersQueryKeys.all, "detail", id] as const,
};

const jobOffersApi = {
  list: async (params?: Record<string, any>, token?: string, signal?: AbortSignal) => {
    try {
      const queryString = params 
        ? `?${stringify(params, { arrayFormat: "comma", encode: false, skipNulls: true })}` 
        : "";
      
      return await apiFetch<PaginatedJobOfferList>(
        `${BASE}${queryString}`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error("[Job Offers API] List failed:", err);
      throw err;
    }
  },

  get: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<JobOffer>(
        `${BASE}${id}/`, 
        { signal }, 
        token
      );
    } catch (err) {
      console.error(`[Job Offers API] Get failed for ID ${id}:`, err);
      throw err;
    }
  },

  accept: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<JobOffer>(
        `${BASE}${id}/accept/`, 
        { method: "POST", signal }, 
        token
      );
    } catch (err) {
      console.error(`[Job Offers API] Accept failed for ID ${id}:`, err);
      throw err;
    }
  },

  decline: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<JobOffer>(
        `${BASE}${id}/decline/`, 
        { method: "POST", signal }, 
        token
      );
    } catch (err) {
      console.error(`[Job Offers API] Decline failed for ID ${id}:`, err);
      throw err;
    }
  },

  view: async (id: number, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<JobOffer>(
        `${BASE}${id}/view/`, 
        { method: "POST", signal }, 
        token
      );
    } catch (err) {
      console.error(`[Job Offers API] View failed for ID ${id}:`, err);
      throw err;
    }
  },
};

export const useJobOffersApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      list: (params?: Record<string, any>, signal?: AbortSignal) => 
        jobOffersApi.list(params, token ?? undefined, signal),
      
      get: (id: number, signal?: AbortSignal) => 
        jobOffersApi.get(id, token ?? undefined, signal),
      
      accept: (id: number, signal?: AbortSignal) => 
        jobOffersApi.accept(id, token ?? undefined, signal),
      
      decline: (id: number, signal?: AbortSignal) => 
        jobOffersApi.decline(id, token ?? undefined, signal),
      
      view: (id: number, signal?: AbortSignal) => 
        jobOffersApi.view(id, token ?? undefined, signal),
    }),
    [token]
  );
};