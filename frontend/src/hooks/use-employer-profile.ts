import { useQuery } from "@tanstack/react-query";
import { useEmployerApi, employerQueryKeys } from "../api/employer";
import { useAuthStore } from "../lib/auth";

export const useEmployerProfile = () => {
  const api = useEmployerApi();
  const { token } = useAuthStore();

  //isAuthenticated 
  return useQuery({
    queryKey: employerQueryKeys.detail(),
    queryFn: ({ signal }) => api.get(signal), 
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
    retry: 1,
  });
};