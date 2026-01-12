import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileApi, profileQueryKeys } from "../api/personalinfo";
import type { components } from "../types/api-schema";

type JobSeekerProfile = components["schemas"]["JobSeekerProfile"];
type JobSeekerProfileUpdate = components["schemas"]["JobSeekerProfileUpdate"];


type AvatarUpdateResponse = JobSeekerProfile | { success: true };

const handleMutationError = (error: unknown) => {
  console.error("[Profile Mutation Error]", error);
};

export const useProfile = ({ profileId }: { profileId?: number } = {}) => {
  const api = useProfileApi();

  return useQuery<JobSeekerProfile>({
    queryKey: profileQueryKeys.detail(), 
    queryFn: () => api.get(),
    staleTime: 1000 * 60 * 5,
    retry: false, 
  });
};

export const useUpdateProfile = () => {
  const api = useProfileApi();
  const qc = useQueryClient();
  
  return useMutation<JobSeekerProfile, unknown, JobSeekerProfileUpdate>({
    mutationFn: (payload) => api.update(payload),
    onSuccess: (data) => {
      qc.setQueryData(profileQueryKeys.detail(), data);
    },
    onError: handleMutationError,
  });
};


export const useUpdateAvatar = () => {
  const api = useProfileApi();
  const qc = useQueryClient();
  
  return useMutation<AvatarUpdateResponse, unknown, File>({
    mutationFn: (file) => api.updateAvatar(file),
    onSuccess: (data) => {
     
      if ("success" in data && data.success) {
        qc.invalidateQueries({ queryKey: profileQueryKeys.detail() });
      } else {
        qc.setQueryData(profileQueryKeys.detail(), data);
      }
    },
    onError: handleMutationError,
  });
};