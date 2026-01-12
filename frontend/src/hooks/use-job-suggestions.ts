import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useAuthStore  } from "../lib/auth"; 


export type JobSuggestion = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  salary_range?: string | null;
  match_score: number;
  match_insights?: Record<string, string | number | boolean>;
  extra?: Record<string, unknown>;
};

export type JobSuggestionsResponse = {
  count: number;
  suggestions: JobSuggestion[];
  source: "cached_application" | "fresh_parse" | "no_resume";
};

const fetchJobSuggestions = async (): Promise<JobSuggestionsResponse> => {
  return await apiFetch<JobSuggestionsResponse>("/applicant/job-suggestions/");
};

export const useJobSuggestions = () => {
  const { user } = useAuthStore ();

  const userId = user?.id ?? null;

  return useQuery({
    queryKey: ["job-suggestions", userId],
    queryFn: fetchJobSuggestions,
    staleTime: 1000 * 60 * 10, 
    gcTime: 1000 * 60 * 30, 
    retry: (failureCount, error: any) => {
      
      if (error?.status === 429) return false;
      
      return failureCount < 1;
    },
    enabled: !!userId, 
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // select: (data) => data.suggestions,
  });
};