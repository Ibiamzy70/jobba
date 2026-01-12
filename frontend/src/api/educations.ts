import { useMemo } from "react";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../stores/auth"; 
import { stringify } from "qs";
import type { components } from "../types/api-schema";

type Education = components["schemas"]["Education"];
type EducationCreate = components["schemas"]["EducationCreate"];
type EducationUpdate = components["schemas"]["EducationUpdate"];
type PaginatedEducationList = components["schemas"]["PaginatedEducationList"];

const BASE = "/applicant/educations/";

export const educationsQueryKeys = {
  all: ["educations"] as const,
  lists: () => [...educationsQueryKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...educationsQueryKeys.lists(), params] as const,
  detail: (id: number) => [...educationsQueryKeys.all, "detail", id] as const,
};

const educationsApi = {
  list: (params?: Record<string, any>, token?: string) => {
    const queryString = params ? `?${stringify(params, { arrayFormat: "comma", encode: false, skipNulls: true })}` : "";
    return apiFetch<PaginatedEducationList>(`${BASE}${queryString}`, {}, token);
  },

  create: (payload: EducationCreate, token?: string) =>
    apiFetch<Education>(BASE, { method: "POST", body: JSON.stringify(payload) }, token),

  update: (id: number, payload: EducationUpdate, token?: string) =>
    apiFetch<Education>(`${BASE}${id}/`, { method: "PATCH", body: JSON.stringify(payload) }, token),

  remove: (id: number, token?: string) =>
    apiFetch<void>(`${BASE}${id}/`, { method: "DELETE" }, token),
};

export const useEducationsApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      list: (params?: Record<string, any>) => educationsApi.list(params, token ?? undefined),
      create: (payload: EducationCreate) => educationsApi.create(payload, token ?? undefined),
      update: (id: number, payload: EducationUpdate) => educationsApi.update(id, payload, token ?? undefined),
      remove: (id: number) => educationsApi.remove(id, token ?? undefined),
    }),
    [token]
  );
};