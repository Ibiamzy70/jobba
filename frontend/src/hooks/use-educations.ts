import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEducationsApi, educationsQueryKeys } from "../api/educations";
import type { components } from "../types/api-schema";

type Education = components["schemas"]["Education"];
type EducationCreate = components["schemas"]["EducationCreate"];
type EducationUpdate = components["schemas"]["EducationUpdate"];
type PaginatedEducationList = components["schemas"]["PaginatedEducationList"];

export const useEducations = (params?: Record<string, any>) => {
  const api = useEducationsApi();

  return useQuery<PaginatedEducationList>({
    queryKey: educationsQueryKeys.list(params),
    queryFn: () => api.list(params),
    
  });
};

export const useCreateEducation = () => {
  const api = useEducationsApi();
  const qc = useQueryClient();

  return useMutation<Education, unknown, EducationCreate>({
    mutationFn: api.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: educationsQueryKeys.lists() }),
  });
};

export const useUpdateEducation = () => {
  const api = useEducationsApi();
  const qc = useQueryClient();

  return useMutation<Education, unknown, { id: number; payload: EducationUpdate }>({
    mutationFn: ({ id, payload }) => api.update(id, payload),
    onSuccess: (data, { id }) => {
      qc.setQueryData(educationsQueryKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: educationsQueryKeys.lists() });
    },
  });
};

export const useDeleteEducation = () => {
  const api = useEducationsApi();
  const qc = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: api.remove,
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: educationsQueryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: educationsQueryKeys.lists() });
    },
  });
};