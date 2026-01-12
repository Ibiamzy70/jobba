import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSkillsApi, skillsQueryKeys } from "../api/skills";
import type { components } from "../types/api-schema";

type Skill = components["schemas"]["Skill"];
type SkillCreate = components["schemas"]["SkillCreate"];
type PaginatedSkillList = components["schemas"]["PaginatedSkillList"];


export const useSkills = (params?: Record<string, any>) => {
  const api = useSkillsApi();

  return useQuery<PaginatedSkillList>({
    queryKey: skillsQueryKeys.list(params),
    queryFn: ({ signal }) => api.list(params, signal),
    select: (data) => {
      // Handle both paginated object and direct array
      const rawResults = Array.isArray(data) ? data : data?.results || [];
      
      // Transform strings to objects for SkillsCard
      const transformedResults = rawResults.map((item: any, index: number) => {
        if (typeof item === "string") {
          return {
            id: index + 1, 
            name: item,
            category: "technical",
            proficiency: "intermediate",
          };
        }
        return item; 
      });

      return {
        count: transformedResults.length,
        next: null,
        previous: null,
        results: transformedResults,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};


export const useCreateSkill = () => {
  const api = useSkillsApi();
  const qc = useQueryClient();
  
  return useMutation<Skill, Error, SkillCreate>({
    mutationFn: (payload) => api.create(payload, undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: skillsQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("[useCreateSkill] Creation failed:", error);
    },
  });
};


export const useDeleteSkill = () => {
  const api = useSkillsApi();
  const qc = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.remove(id, undefined),
    onSuccess: (_, id) => {
      // Remove the deleted item from cache
      qc.removeQueries({ queryKey: skillsQueryKeys.detail(id) });
      
      qc.invalidateQueries({ queryKey: skillsQueryKeys.lists() });
    },
    onError: (error, id) => {
      console.error(`[useDeleteSkill] Deletion failed for ID ${id}:`, error);
    },
  });
};

export { skillsQueryKeys };