import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { useAuthStore } from "../lib/auth";
import { useJob, useCreateJob, useUpdateJob } from "../hooks/useJobs";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, ArrowLeft, Briefcase, MapPin, DollarSign, Building2, Sparkles, Layout } from "lucide-react"; 
import { useToast } from "../hooks/use-toast";
import { UploadIcon } from "../components/icons/iconhub"

const employmentTypes = [
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Temporary", value: "temporary" },
  { label: "Internship", value: "internship" },
  { label: "Gig / One-off", value: "gig" },
];

const experienceLevels = [
  { label: "Unskilled / Manual Labor", value: "unskilled" },
  { label: "Semi-skilled / Technical Assistant", value: "semi_skilled" },
  { label: "Skilled / Trade Professional", value: "skilled" },
  { label: "Intern", value: "intern" },
  { label: "Junior", value: "junior" },
  { label: "Mid Level", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Lead", value: "lead" },
  { label: "Director", value: "director" },
  { label: "Professional / White Collar", value: "professional" },
];

type JobTypeValue = "full_time" | "part_time" | "contract" | "temporary" | "internship" | "gig";
type EmploymentLevelValue = "unskilled" | "semi_skilled" | "skilled" | "intern" | "junior" | "mid" | "senior" | "lead" | "director" | "professional";

export default function JobForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const { data: job, isLoading: jobLoading } = useJob(isEdit ? id : undefined);

  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    company: string;
    location: string;
    job_type: JobTypeValue | "";
    employment_level: EmploymentLevelValue | "";
    salary_min: string;
    salary_max: string;
  }>({
    title: "",
    description: "",
    company: "",
    location: "",
    job_type: "",
    employment_level: "",
    salary_min: "",
    salary_max: "",
  });

  useEffect(() => {
    if (job && isEdit) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        company: job.company || "",
        location: job.location || "",
        job_type: (job.job_type as JobTypeValue) || "",
        employment_level: (job.employment_level as EmploymentLevelValue) || "",
        salary_min: job.salary_min?.toString() || "",
        salary_max: job.salary_max?.toString() || "",
      });
    }
  }, [job, isEdit]);

  if (isEdit && job && job.owner !== user?.id) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-6 bg-[#020617]">
          <Card className="max-w-md border-white/5 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                Unauthorized Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm leading-relaxed">
                You do not have administrative permission to edit this job posting. Please contact your organization owner.
              </p>
              <Button 
                variant="outline"
                className="mt-6 w-full border-white/10 hover:bg-white/5" 
                onClick={() => navigate("/dashboard/jobs")}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.job_type || !formData.employment_level) {
      toast({
        title: "Configuration Required",
        description: "Please specify the employment type and experience level.",
        variant: "destructive",
      });
      return;
    }

    const salaryMin = formData.salary_min ? Number(formData.salary_min) : undefined;
    const salaryMax = formData.salary_max ? Number(formData.salary_max) : undefined;

    if (salaryMin && salaryMax && salaryMin > salaryMax) {
      toast({
        title: "Salary Range Conflict",
        description: "The floor (min) cannot be higher than the ceiling (max).",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEdit) {
        const updatePayload = {
          title: formData.title,
          description: formData.description,
          company: formData.company,
          location: formData.location,
          job_type: formData.job_type as JobTypeValue,
          employment_level: formData.employment_level as EmploymentLevelValue,
          salary_min: salaryMin,
          salary_max: salaryMax,
        };

        const result = await updateMutation.mutateAsync({
          id: Number(id),
          payload: updatePayload as any,
        });

        toast({
          title: "Update Successful",
          description: "The job listing has been updated in the cloud.",
        });
        navigate(`/jobs/${result.id}`);
      } else {
        const createPayload = {
          title: formData.title,
          description: formData.description,
          company: formData.company,
          location: formData.location,
          job_type: formData.job_type as JobTypeValue,
          employment_level: formData.employment_level as EmploymentLevelValue,
          salary_min: salaryMin,
          salary_max: salaryMax,
          is_published: true,
        };

        const result = await createMutation.mutateAsync(createPayload as any);

        toast({
          title: "Deployment Successful",
          description: "Your new job posting is now live.",
        });
        navigate(`/jobs/${result.id}`);
      }
    } catch (err: any) {
      const errorDetails = err?.response?.data;
      let message = "An error occurred while saving the data.";

      if (errorDetails) {
        if (typeof errorDetails === "string") {
          message = errorDetails;
        } else if (errorDetails.detail) {
          message = errorDetails.detail;
        } else if (errorDetails.message) {
          message = errorDetails.message;
        } else {
          const fieldErrors = Object.entries(errorDetails)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
            .join("; ");
          if (fieldErrors) message = fieldErrors;
        }
      }

      toast({
        title: "Request Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (jobLoading && isEdit) {
    return (
      <div className="min-h-screen flex flex-col bg-[#020617]">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing editor...</p>
          </div>
        </main>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">
      <NavBar />
      <main className="flex-1 py-16 px-4 md:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-900/0 to-slate-900/0">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-8">
            <div className="space-y-1">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-xs font-bold tracking-widest text-slate-500 hover:text-emerald-500 transition-colors uppercase gap-2 mb-4 group"
              >
                <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
              </button>
              <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl">
                {isEdit ? "Edit Posting" : "Create Listing"}
              </h1>
              <p className="text-slate-400 text-sm font-light max-w-md">
                {isEdit 
                  ? "Synchronize your talent requirements with the global workforce." 
                  : "Launch a high-performance listing to capture world-class expertise."}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Editor Mode</p>
                  <p className="text-xs text-emerald-500 font-medium">{isEdit ? "Revision 2.1.0" : "Job posting"}</p>
               </div>
               <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
               </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500" />
              <CardHeader className="px-8 pt-8">
                <CardTitle className="flex items-center gap-3 text-white text-xl font-bold tracking-tight">
                  <Layout className="h-5 w-5 text-emerald-500" />
                  Primary Configuration
                </CardTitle>
              </CardHeader>
              
              <CardContent className="grid gap-8 px-8 pb-10">
                {/* Section 1: Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-400">Job Title</Label>
                    <Input
                      id="title"
                      className="bg-slate-950/50 border-white/5 focus:border-emerald-500/50 h-12 text-white placeholder:text-slate-600 transition-all shadow-inner"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Lead Systems Architect"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="company" className="text-xs font-bold uppercase tracking-widest text-slate-400">Company Name</Label>
                    <div className="relative">
                       <Building2 className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-600" />
                       <Input
                        id="company"
                        className="bg-slate-950/50 border-white/5 focus:border-emerald-500/50 h-12 pl-12 text-white placeholder:text-slate-600 transition-all shadow-inner"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Global Dynamics"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-slate-400">Workforce Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-600 transition-colors group-focus-within:text-emerald-500" />
                    <Input
                      id="location"
                      className="bg-slate-950/50 border-white/5 focus:border-emerald-500/50 h-12 pl-12 text-white placeholder:text-slate-600 transition-all shadow-inner"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Remote (Global) or Specific City"
                      required
                    />
                  </div>
                </div>

                {/* Section 2: Classifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6 rounded-2xl bg-slate-950/30 border border-white/5">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Employment Logic</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => setFormData({ ...formData, job_type: value as JobTypeValue })}
                      required
                    >
                      <SelectTrigger className="bg-slate-950 border-white/5 h-12 text-white focus:ring-emerald-500/20">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        {employmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="focus:bg-emerald-500 focus:text-white">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Seniority Matrix</Label>
                    <Select
                      value={formData.employment_level}
                      onValueChange={(value) => setFormData({ ...formData, employment_level: value as EmploymentLevelValue })}
                      required
                    >
                      <SelectTrigger className="bg-slate-950 border-white/5 h-12 text-white focus:ring-emerald-500/20">
                        <SelectValue placeholder="Select Seniority" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value} className="focus:bg-emerald-500 focus:text-white">
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Section 3: Remuneration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="salary_min" className="text-xs font-bold uppercase tracking-widest text-slate-400">Min compensation</Label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-3.5 h-5 w-5 bg-emerald-500/10 rounded flex items-center justify-center border border-emerald-500/20">
                         <DollarSign className="h-3 w-3 text-emerald-500" />
                      </div>
                      <Input
                        id="salary_min"
                        type="number"
                        className="bg-slate-950/50 border-white/5 focus:border-emerald-500/50 h-12 pl-12 text-white placeholder:text-slate-600 transition-all"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="salary_max" className="text-xs font-bold uppercase tracking-widest text-slate-400">Max compensation</Label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3.5 h-5 w-5 bg-blue-500/10 rounded flex items-center justify-center border border-blue-500/20">
                         <DollarSign className="h-3 w-3 text-blue-500" />
                      </div>
                      <Input
                        id="salary_max"
                        type="number"
                        className="bg-slate-950/50 border-white/5 focus:border-blue-500/50 h-12 pl-12 text-white placeholder:text-slate-600 transition-all"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Narrative */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                     <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-400">Role Narrative</Label>
                     <span className="text-[10px] text-slate-500 font-mono tracking-tighter">Markdown Supported</span>
                  </div>
                  <Textarea
                    id="description"
                    className="min-h-[280px] bg-slate-950/50 border-white/5 focus:border-emerald-500/50 text-white placeholder:text-slate-700 leading-relaxed resize-none p-6 text-base shadow-inner"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Elaborate on the technical roadmap, core KPIs, and the specialized environment..."
                    required
                  />
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5">
                    <Sparkles className="h-3 w-3 text-emerald-500" />
                    Insight: Rich descriptions increase high-quality application rates by 42%.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Actions */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-6 pt-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                disabled={isSubmitting}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all disabled:opacity-50"
              >
                Abort Changes
              </button>
              
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="h-14 px-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-tight text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-3 h-5 w-5" />
                    {isEdit ? "Confirm Updates" : "Deploy Job Posting"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
    </div>
  );
}