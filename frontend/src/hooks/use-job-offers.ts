import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useJobOffersApi, jobOffersQueryKeys } from "../api/job-offers";
import type { components } from "../types/api-schema";

type JobOffer = components["schemas"]["JobOffer"];
type PaginatedJobOfferList = components["schemas"]["PaginatedJobOfferList"];

const handleMutationError = (error: unknown) => {
  console.error("[Job Offers Mutation Error]", error);
  // Optional: toast.error("Operation failed. Please try again.");
};

export const useJobOffers = (params?: Record<string, any>) => {
  const api = useJobOffersApi();
  
  return useQuery<PaginatedJobOfferList>({
    queryKey: jobOffersQueryKeys.list(params),
    queryFn: ({ signal }) => api.list(params, signal), 
    enabled: !!params?.profile,
    staleTime: 1000 * 60 * 2, 
  });
};

export const useJobOffer = (id?: number) => {
  const api = useJobOffersApi();
  
  return useQuery<JobOffer>({
    queryKey: jobOffersQueryKeys.detail(id!),
    queryFn: ({ signal }) => api.get(id!, signal), 
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAcceptOffer = () => {
  const api = useJobOffersApi();
  const qc = useQueryClient();
  
  return useMutation<JobOffer, unknown, number>({
    mutationFn: api.accept,
    onSuccess: (data, id) => {
      // Update the specific offer in cache
      qc.setQueryData(jobOffersQueryKeys.detail(id), data);
      // Invalidate lists to show updated status
      qc.invalidateQueries({ queryKey: jobOffersQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};

export const useDeclineOffer = () => {
  const api = useJobOffersApi();
  const qc = useQueryClient();
  
  return useMutation<JobOffer, unknown, number>({
    mutationFn: api.decline,
    onSuccess: (data, id) => {
      qc.setQueryData(jobOffersQueryKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: jobOffersQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};

export const useViewOffer = () => {
  const api = useJobOffersApi();
  const qc = useQueryClient();
  
  return useMutation<JobOffer, unknown, number>({
    mutationFn: api.view,
    onSuccess: (data, id) => {
      qc.setQueryData(jobOffersQueryKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: jobOffersQueryKeys.lists() });
    },
    onError: handleMutationError,
  });
};