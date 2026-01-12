import { apiFetch } from "../lib/api";
import { useMemo } from "react";
import { useAuthStore } from "../lib/auth";
import type { components } from "../types/api-schema";

type Employer = components["schemas"]["Employer"];
type EmployerUpdate = components["schemas"]["EmployerUpdate"];

const BASE = "/employers/me/";

export const employerQueryKeys = {
  all: ["employer"] as const,
  detail: () => [...employerQueryKeys.all, "detail"] as const,
};

const employerApi = {
  get: async (token?: string, signal?: AbortSignal) => {
    return await apiFetch<Employer>(BASE, { signal }, token);
  },

  update: async (payload: EmployerUpdate, token?: string, signal?: AbortSignal) => {
    return await apiFetch<Employer>(
      BASE,
      { method: "PATCH", body: JSON.stringify(payload), signal },
      token
    );
  },
};

// ← FIXED: Proper token binding + meaningful memo
export const useEmployerApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      get: (signal?: AbortSignal) => employerApi.get(token ?? undefined, signal),
      update: (payload: EmployerUpdate, signal?: AbortSignal) =>
        employerApi.update(payload, token ?? undefined, signal),
    }),
    [token]
  );
};