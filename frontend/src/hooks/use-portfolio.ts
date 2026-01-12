import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePortfolioApi, portfolioQueryKeys } from "../api/portfolio";
import type { components } from "../types/api-schema";

type PortfolioItem = components["schemas"]["PortfolioItem"];
type PaginatedPortfolioItemList = components["schemas"]["PaginatedPortfolioItemList"];

export const usePortfolio = (params?: Record<string, any>) => {
  const api = usePortfolioApi();

  return useQuery<PaginatedPortfolioItemList>({
    queryKey: portfolioQueryKeys.list(params),
    queryFn: ({ signal }) => api.list(params, signal),
    // ← FIXED: Always enabled for current user
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const usePortfolioItem = (id: number) => {
  const api = usePortfolioApi();

  return useQuery<PortfolioItem>({
    queryKey: portfolioQueryKeys.detail(id),
    queryFn: ({ signal }) => api.get(id, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreatePortfolioItem = () => {
  const api = usePortfolioApi();
  const qc = useQueryClient();

  return useMutation<PortfolioItem, Error, FormData>({
    mutationFn: (payload) => api.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("[useCreatePortfolioItem] Creation failed:", error);
    },
  });
};

export const useUpdatePortfolioItem = () => {
  const api = usePortfolioApi();
  const qc = useQueryClient();

  return useMutation<PortfolioItem, Error, { id: number; payload: FormData }>({
    mutationFn: ({ id, payload }) => api.update(id, payload),
    onSuccess: (data, { id }) => {
      qc.setQueryData(portfolioQueryKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.lists() });
    },
    onError: (error, { id }) => {
      console.error(`[useUpdatePortfolioItem] Update failed for ID ${id}:`, error);
    },
  });
};

export const useDeletePortfolioItem = () => {
  const api = usePortfolioApi();
  const qc = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => api.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: portfolioQueryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: portfolioQueryKeys.lists() });
    },
    onError: (error, id) => {
      console.error(`[useDeletePortfolioItem] Deletion failed for ID ${id}:`, error);
    },
  });
};