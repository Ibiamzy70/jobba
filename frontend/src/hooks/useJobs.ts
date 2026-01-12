import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useJobsApi } from "../api/jobs";
import { jobsQueryKeys } from "../api/jobs";
import type { components } from "../types/api-schema";
import { stringify } from "qs";


const stableStringify = (obj?: Record<string, any>): string => {
  if (!obj) return "";
  return stringify(obj, { arrayFormat: "comma", encode: false, skipNulls: true });
};

const handleMutationError = (error: unknown) => {
  console.error("[Jobs Mutation Error]", error);
};

type Job = components["schemas"]["Job"];
type JobCreate = components["schemas"]["JobCreate"];
type JobUpdate = components["schemas"]["JobUpdate"];
type PaginatedJobList = components["schemas"]["PaginatedJobList"];

/**
 * Fetch paginated job list with filters
 * Only includes truthy params — prevents "undefined" in URL
 */
export const useJobs = (params?: Record<string, any>) => {
  const jobsApi = useJobsApi();

  // ← FIXED: Clean params — omit undefined/null/empty
  const cleanParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) =>
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0)
        )
      )
    : undefined;

  return useQuery<PaginatedJobList>({
    queryKey: jobsQueryKeys.list(cleanParams),
    queryFn: () => jobsApi.list(cleanParams),
    staleTime: 1000 * 60 * 2,
    // Enabled even with empty params — allows initial load
    enabled: true,
  });
};

/**
 * Fetch single job by ID
 */
export const useJob = (id?: string | number) => {
  const jobsApi = useJobsApi();

  return useQuery<Job>({
    queryKey: jobsQueryKeys.detail(id!),
    queryFn: () => jobsApi.get(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Create job
 */
export const useCreateJob = () => {
  const jobsApi = useJobsApi();
  const qc = useQueryClient();

  return useMutation<Job, unknown, JobCreate | FormData>({
    mutationFn: (payload) => jobsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobsQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};

/**
 * Update job
 */
export const useUpdateJob = () => {
  const jobsApi = useJobsApi();
  const qc = useQueryClient();

  return useMutation<
    Job,
    unknown,
    { id: string | number; payload: JobUpdate | FormData }
  >({
    mutationFn: ({ id, payload }) => jobsApi.update(id, payload),
    onSuccess: (data, { id }) => {
      qc.setQueryData<Job>(jobsQueryKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: jobsQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};

/**
 * Delete job
 */
export const useDeleteJob = () => {
  const jobsApi = useJobsApi();
  const qc = useQueryClient();

  return useMutation<void, unknown, string | number>({
    mutationFn: (id) => jobsApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: jobsQueryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: jobsQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};