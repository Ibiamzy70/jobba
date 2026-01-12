import { apiFetch } from "../lib/api";
import { useMemo } from "react";
import { useAuthStore } from "../stores/auth";
import type { components } from "../types/api-schema";

type JobSeekerProfile = components["schemas"]["JobSeekerProfile"];
type JobSeekerProfileUpdate = components["schemas"]["JobSeekerProfileUpdate"];

const BASE = "/applicant/profile/";

export const profileQueryKeys = {
  all: ["profile"] as const,
  detail: () => [...profileQueryKeys.all, "detail"] as const,
};

const profileApi = {
  get: async (token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<JobSeekerProfile>(BASE, { signal }, token);
    } catch (err) {
      console.error("[Profile API] Get failed:", err);
      throw err;
    }
  },

  update: async (payload: JobSeekerProfileUpdate, token?: string, signal?: AbortSignal) => {
    try {
      return await apiFetch<JobSeekerProfile>(
        BASE, 
        { method: "PATCH", body: JSON.stringify(payload), signal }, 
        token
      );
    } catch (err) {
      console.error("[Profile API] Update failed:", err);
      throw err;
    }
  },

  // ← Fixed: Now uses apiFetch — consistent, secure, no 401
  updateAvatar: async (file: File, token?: string, signal?: AbortSignal) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      return await apiFetch<JobSeekerProfile | { success: true }>(
        BASE,
        {
          method: "PATCH",
          body: formData,
          signal,
        },
        token
      );
    } catch (err) {
      console.error("[Profile API] Avatar upload failed:", err);
      throw err;
    }
  },
};

export const useProfileApi = () => {
  const token = useAuthStore((s) => s.token);

  return useMemo(
    () => ({
      get: (signal?: AbortSignal) => profileApi.get(token ?? undefined, signal),
      update: (payload: JobSeekerProfileUpdate, signal?: AbortSignal) =>
        profileApi.update(payload, token ?? undefined, signal),
      updateAvatar: (file: File, signal?: AbortSignal) =>
        profileApi.updateAvatar(file, token ?? undefined, signal),
    }),
    [token]
  );
};