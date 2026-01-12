import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  MapPin,
  Clock,
  DollarSign,
  Share2,
  Bookmark,
  Building2,
  ArrowLeft,
  Loader2,
  Globe,
  CheckCircle2,
  Calendar,
  Briefcase
} from "lucide-react";
import { useJob } from "../hooks/useJobs";
import { useToast } from "../hooks/use-toast";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  // Fetch logic
  const { data: job, isLoading, isError } = useJob(id);

  // --- HANDLERS & HELPERS ---

  const handleShare = () => {
    const shareData = {
      title: job?.title || 'Job Opportunity',
      text: `Check out this job: ${job?.title} at ${job?.company}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {}); // Silent catch for user cancellation
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ 
        title: "Link copied",
        description: "Job URL has been copied to your clipboard.",
      });
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    toast({
      title: !saved ? "Job Saved" : "Job Removed",
      description: !saved ? "This job has been added to your saved list." : "Removed from your saved list.",
    });
  };

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return "Competitive Salary";
    if (job.salary_min && job.salary_max) {
      return `₦${job.salary_min.toLocaleString()} – ₦${job.salary_max.toLocaleString()}`;
    }
    if (job.salary_min) return `From ₦${job.salary_min.toLocaleString()}`;
    if (job.salary_max) return `Up to ₦${job.salary_max.toLocaleString()}`;
    return "Competitive Salary";
  };

  const formatPostedDate = () => {
    if (!job?.created_at) return "Recently posted";
    const date = new Date(job.created_at);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  const formatEmploymentType = (type?: string) => {
    if (!type) return "Full-time";
    return type
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper to safely access company_logo
  const getCompanyLogo = () => {
    return (job as any)?.company_logo || null;
  };

  // --- RENDER STATES ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium animate-pulse">Loading job details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl text-center max-w-md w-full">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
            <p className="text-gray-500 mb-8">
              The job listing you are looking for might have expired or been removed.
            </p>
            <Button onClick={() => navigate('/jobs')} className="w-full bg-blue-600 hover:bg-blue-700">
              Browse All Jobs
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const companyLogo = getCompanyLogo();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <NavBar />
      
      <main className="flex-1 relative pb-12">
        {/* --- BLUE HEADER BACKDROP --- */}
        <div className="absolute top-0 left-0 w-full h-80 bg-blue-900 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-800 opacity-90" />
          {/* Background decoration matching Job List */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl mix-blend-screen opacity-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl mix-blend-screen opacity-10" />
        </div>

        <div className="container relative z-10 px-4 pt-8">
          {/* Back Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-blue-100 hover:text-white mb-8 transition-colors w-fit"
          >
            <div className="bg-white/10 p-2 rounded-full mr-3 group-hover:bg-white/20 transition-all">
               <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Back to Jobs</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* --- LEFT COLUMN (Content) --- */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 1. HERO CARD */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Logo */}
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 flex-shrink-0 shadow-sm">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={`${job.company} logo`}
                        className="h-full w-full object-contain rounded-xl"
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-gray-400" />
                    )}
                  </div>

                  {/* Title & Meta */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                        {job.title}
                      </h1>
                      <div className="flex items-center gap-2 mt-2 text-lg text-blue-600 font-medium">
                        {job.company}
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 text-base font-normal underline decoration-dotted cursor-pointer hover:text-blue-600 transition-colors">
                          Visit Website
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        {formatEmploymentType(job.job_type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        Posted {formatPostedDate()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile-Only Action Buttons (Visible only on small screens) */}
                <div className="mt-8 flex flex-col gap-3 sm:hidden">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold" onClick={() => navigate(`/apply/${job.id}`)}>
                    Apply Now
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-gray-200" onClick={handleSave}>
                      <Bookmark className={`mr-2 h-4 w-4 ${saved ? 'fill-blue-600 text-blue-600' : ''}`} />
                      {saved ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" className="flex-1 border-gray-200" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2. DESCRIPTION CARD */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/60">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="h-6 w-1 bg-blue-600 rounded-full" />
                  Job Description
                </h2>
                
                {/* Using a prose-like structure. 
                  In a real app, you might use 'dangerouslySetInnerHTML' if the backend sends HTML,
                  or a Markdown renderer. Here we style the text container.
                */}
                <div className="prose prose-slate prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.description || "No description provided for this position."}
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN (Sidebar) --- */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                
                {/* Action Card (Desktop) */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hidden sm:block">
                  <div className="text-center mb-6">
                    <p className="text-gray-500 text-sm mb-1">Interested in this job?</p>
                    <div className="text-emerald-600 font-bold text-lg flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Actively Hiring
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      size="lg" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all h-12 text-base font-semibold"
                      onClick={() => navigate(`/apply/${job.id}`)}
                    >
                      Apply Now
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className={`w-full border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-colors ${saved ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`}
                        onClick={handleSave}
                      >
                        <Bookmark className={`mr-2 h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                        {saved ? 'Saved' : 'Save'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={handleShare}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Job Overview Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
                  <h3 className="font-bold text-gray-900 mb-5">Job Overview</h3>
                  
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Salary</p>
                        <p className="text-gray-900 font-semibold mt-0.5">{formatSalary()}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-gray-900 font-semibold mt-0.5">{job.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Job Type</p>
                        <p className="text-gray-900 font-semibold mt-0.5">{formatEmploymentType(job.job_type)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date Posted</p>
                        <p className="text-gray-900 font-semibold mt-0.5">{formatPostedDate()}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-6 border-gray-100" />
                  
                  {/* Company Mini-Profile */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">About the company</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                         {companyLogo ? (
                           <img src={companyLogo} className="h-6 w-6 object-contain" alt="" />
                         ) : (
                           <Building2 className="h-5 w-5 text-gray-400" />
                         )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{job.company}</p>
                        <p className="text-xs text-gray-500">Internet & Technology</p>
                      </div>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700 text-sm">
                      View company profile
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetail;