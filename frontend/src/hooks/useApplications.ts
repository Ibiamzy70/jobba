import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApplicationsApi } from "../api/applications";
import { applicationsQueryKeys } from "../api/applications";
import type { components } from "../types/api-schema";

type Application = components["schemas"]["Application"];
type ApplicationCreate = components["schemas"]["ApplicationCreate"];
type ApplicationUpdate = components["schemas"]["ApplicationUpdate"];
type PaginatedApplicationList = components["schemas"]["PaginatedApplicationList"];

const handleMutationError = (error: unknown) => {
  console.error("[Applications Mutation Error]", error);
};

/**
 * List applications — for applicant view
 */
export const useApplications = (params?: Record<string, any>) => {
  const api = useApplicationsApi();

  return useQuery<PaginatedApplicationList>({
    queryKey: applicationsQueryKeys.list(params),
    queryFn: () => api.list(params),
    staleTime: 1000 * 60 * 3,
    // Always enabled — empty params return empty list safely
    enabled: true,
  });
};

/**
 * Single application detail
 */
export const useApplication = (id?: string | number) => {
  const api = useApplicationsApi();

  return useQuery<Application>({
    queryKey: applicationsQueryKeys.detail(id!),
    queryFn: () => api.get(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Submit new application
 */
export const useCreateApplication = () => {
  const api = useApplicationsApi();
  const qc = useQueryClient();

  return useMutation<Application, unknown, ApplicationCreate | FormData>({
    mutationFn: api.create,
    onSuccess: (newApplication) => {
      // Optimistically prepend to all applicant list caches
      qc.setQueriesData<PaginatedApplicationList>(
        { queryKey: applicationsQueryKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                count: old.count + 1,
                results: [newApplication, ...old.results],
              }
            : old
      );

      // Invalidate as backup
      qc.invalidateQueries({ queryKey: applicationsQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};

/**
 * Update application (employer actions)
 */
export const useUpdateApplication = () => {
  const api = useApplicationsApi();
  const qc = useQueryClient();

  return useMutation<
    Application,
    unknown,
    { id: string | number; payload: ApplicationUpdate | FormData }
  >({
    mutationFn: ({ id, payload }) => api.update(id, payload),
    onSuccess: (updated, { id }) => {
      // Update detail cache
      qc.setQueryData<Application>(applicationsQueryKeys.detail(id), updated);

      // Update all list appearances
      qc.setQueriesData<PaginatedApplicationList>(
        { queryKey: applicationsQueryKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                results: old.results.map((app) =>
                  app.id === updated.id ? updated : app
                ),
              }
            : old
      );

      qc.invalidateQueries({ queryKey: applicationsQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};

/**
 * Delete/withdraw application
 */
export const useDeleteApplication = () => {
  const api = useApplicationsApi();
  const qc = useQueryClient();

  return useMutation<void, unknown, string | number>({
    mutationFn: api.remove,
    onSuccess: (_, id) => {
      const numId = Number(id);

      qc.setQueriesData<PaginatedApplicationList>(
        { queryKey: applicationsQueryKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                count: Math.max(0, old.count - 1),
                results: old.results.filter((app) => app.id !== numId),
              }
            : old
      );

      qc.removeQueries({ queryKey: applicationsQueryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: applicationsQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};