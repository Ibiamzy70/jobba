import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEmployerApi, employerQueryKeys } from "../api/employer";
import type { components } from "../types/api-schema";

type EmployerUpdate = components["schemas"]["EmployerUpdate"];

export const useUpdateEmployerProfile = () => {
  const api = useEmployerApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployerUpdate) => api.update(payload),
    onSuccess: (data) => {
      qc.setQueryData(employerQueryKeys.detail(), data);
    },
    onError: (error) => {
      console.error("[useUpdateEmployerProfile] Update failed:", error);
      
    },
  });
};