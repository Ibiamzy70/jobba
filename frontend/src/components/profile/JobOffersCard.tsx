import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import {
  Sparkles,
  Loader2,
  Target,
  Zap,
  Upload,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { DashboardDocumentIcon } from "../icons/iconhub"; 
import { motion } from "framer-motion";
import { useJobSuggestions, JobSuggestion } from "../../hooks/use-job-suggestions";
import { ResumeUploadModal } from "../ResumeUploadModal";
import { useQueryClient } from "@tanstack/react-query";

const JobSuggestionsCard = memo(function JobSuggestionsCard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useJobSuggestions();

  const suggestions = response?.suggestions ?? [];
  const source = response?.source;
  const hasSuggestions = suggestions.length > 0;
  const needsResume = source === "no_resume";

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const formatSalary = useCallback((suggestion: JobSuggestion): string | null => {
    if (suggestion.salary_range) return suggestion.salary_range;
    const min = (suggestion as any).salary_min;
    const max = (suggestion as any).salary_max;
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    if (max) return `Up to ${fmt(max)}`;
    return null;
  }, []);

  const getScoreBadge = useCallback((score: number) => {
    if (score >= 90)
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm transition-all group-hover:bg-emerald-500 group-hover:text-white">
          <Zap className="h-3 w-3 mr-1" />
          Excellent Match
        </Badge>
      );
    if (score >= 80)
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-sm transition-all group-hover:bg-blue-600 group-hover:text-white">
          <Target className="h-3 w-3 mr-1" />
          Great Fit
        </Badge>
      );
    return (
      <Badge variant="secondary" className="font-medium opacity-80">
        Good Match
      </Badge>
    );
  }, []);

  const handleViewJob = useCallback(
    (jobId: string) => { navigate(`/jobs/${jobId}`); },
    [navigate]
  );

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["job-suggestions"] });
  };

  return (
    <>
      <Card className="h-fit border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-inner">
              <DashboardDocumentIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-slate-800">
                AI Job Recommendations
              </CardTitle>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Curated based on your profile</p>
            </div>
          </div>
          
          {hasSuggestions && (
            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-lg leading-none">{suggestions.length}</span>
              <span className="text-[10px] text-blue-100 font-medium uppercase tracking-tighter">Matches</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="relative inline-block">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <div className="absolute inset-0 blur-lg bg-blue-400/20 animate-pulse"></div>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">Scanning global opportunities...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 px-6">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-red-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Connection Error</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-[240px] mx-auto">
                {(error as any)?.message || "We couldn't reach the AI engine right now."}
              </p>
            </div>
          ) : hasSuggestions ? (
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-3">
                {suggestions.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="group relative p-5 rounded-2xl border border-transparent bg-white hover:bg-slate-50/80 hover:border-blue-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => handleViewJob(job.id)}
                  >
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 rounded-xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                        <AvatarImage src={(job as any).company_logo_url} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                          {job.company?.slice(0, 2).toUpperCase() ?? "CO"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                        </div>
                        
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="truncate">{job.company}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="text-slate-400">{job.location || "Remote"}</span>
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
                          <div className="flex gap-2 items-center">
                            {formatSalary(job) && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                <DollarSign className="h-3 w-3 mr-0.5" />
                                {formatSalary(job)}
                              </span>
                            )}
                            {getScoreBadge(job.match_score)}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 group-hover:translate-x-1 transition-all"
                          >
                            Details
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          ) : needsResume ? (
            <div className="text-center py-20 px-6 bg-slate-50/30 m-4 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Unlock Recommendations</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-[200px] mx-auto">
                Upload your resume to let our AI find your perfect career match.
              </p>
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
              >
                Upload Resume
              </Button>
            </div>
          ) : (
            <div className="text-center py-24 px-6">
              <Target className="h-16 w-16 mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No matches found yet</h3>
              <p className="text-sm text-slate-500 max-w-[220px] mx-auto">
                We're constantly updating. Check back in a few hours for new roles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ResumeUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
});

export default JobSuggestionsCard;