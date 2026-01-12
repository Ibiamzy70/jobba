import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useExperiencesApi, experiencesQueryKeys } from "../api/experiences";
import type { components } from "../types/api-schema";

type Experience = components["schemas"]["Experience"];
type ExperienceCreate = components["schemas"]["ExperienceCreate"];
type ExperienceUpdate = components["schemas"]["ExperienceUpdate"];
type PaginatedExperienceList = components["schemas"]["PaginatedExperienceList"];

const handleMutationError = (error: unknown) => {
  console.error("[Experiences Mutation Error]", error);
  
};

export const useExperiences = (params?: Record<string, any>) => {
  const api = useExperiencesApi();
  
  return useQuery<PaginatedExperienceList>({
    queryKey: experiencesQueryKeys.list(params),
    queryFn: ({ signal }) => api.list(params, signal), 
    
    staleTime: 1000 * 60 * 3,
  });
};


export const useCreateExperience = () => {
  const api = useExperiencesApi();
  const qc = useQueryClient();
  
  return useMutation<Experience, unknown, ExperienceCreate>({
    mutationFn: api.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: experiencesQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};

export const useUpdateExperience = () => {
  const api = useExperiencesApi();
  const qc = useQueryClient();
  
  return useMutation<Experience, unknown, { id: number; payload: ExperienceUpdate }>({
    mutationFn: ({ id, payload }) => api.update(id, payload),
    onSuccess: (data, { id }) => {
      qc.setQueryData(experiencesQueryKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: experiencesQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};

export const useDeleteExperience = () => {
  const api = useExperiencesApi();
  const qc = useQueryClient();
  
  return useMutation<void, unknown, number>({
    mutationFn: api.remove,
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: experiencesQueryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: experiencesQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};