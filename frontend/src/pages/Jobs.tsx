import { useState, useEffect, useMemo } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Search,
  Filter,
  X,
  MapPin,
  Loader2,
  Sparkles,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useJobs } from "../hooks/useJobs";
import { useDebounce } from "use-debounce";

const Jobs = () => {
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [rawLocation, setRawLocation] = useState("");
  const [jobType, setJobType] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [searchTerm] = useDebounce(rawSearchTerm, 500);
  const [location] = useDebounce(rawLocation, 500);

  const { data: jobsData, isLoading, isError, refetch } = useJobs({
    is_published: true,
    search: searchTerm || undefined,
    location: location || undefined,
    job_type: jobType.length > 0 ? jobType.join(",") : undefined, 
  });

  const jobs = jobsData?.results ?? [];

  
  const backendJobTypes = [
    "full_time",
    "part_time",
    "contract",
    "temporary",
    "internship",
    "gig",
  ];

  const typeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    temporary: "Temporary",
    internship: "Internship",
    gig: "Gig / One-off",
  };

  const toggleJobType = (type: string) => {
    setJobType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setRawSearchTerm("");
    setRawLocation("");
    setJobType([]);
  };

  const hasActiveFilters = !!searchTerm || !!location || jobType.length > 0;

  
  const mappedJobs = useMemo(() => {
    return jobs.map((job: any) => ({
      ...job,
      employment_type:
        job.job_type === "full_time"
          ? "full-time"
          : job.job_type === "part_time"
          ? "part-time"
          : job.job_type || "full-time", 
    }));
  }, [jobs]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <NavBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-blue-900 pb-20 pt-16 sm:pb-24 sm:pt-24 lg:pb-32">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl mix-blend-screen" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl mix-blend-screen" />
          </div>
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/50 backdrop-blur-sm border border-blue-700/50 mb-6 shadow-xl">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-blue-100">
                  Discover your next career move
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Find Your Perfect Job <br />
                <span className="text-emerald-400">Today</span>
              </h1>

              <p className="text-lg text-blue-100/80 max-w-xl mx-auto">
                Browse through thousands of job listings and connect with top companies hiring right now.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200 group-focus-within:text-white transition-colors" />
                    <Input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      className="pl-12 h-12 sm:h-14 text-base bg-blue-950/30 border-blue-800/30 text-white placeholder:text-blue-300/50 focus:bg-blue-950/50 focus:border-emerald-500/50 transition-all rounded-xl"
                      value={rawSearchTerm}
                      onChange={(e) => setRawSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200 group-focus-within:text-white transition-colors" />
                    <Input
                      type="text"
                      placeholder="Location (city, state, or remote)"
                      className="pl-12 h-12 sm:h-14 text-base bg-blue-950/30 border-blue-800/30 text-white placeholder:text-blue-300/50 focus:bg-blue-950/50 focus:border-emerald-500/50 transition-all rounded-xl"
                      value={rawLocation}
                      onChange={(e) => setRawLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-10 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                className="w-full flex items-center justify-between gap-2 h-12 bg-white shadow-sm border-gray-200"
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium">
                      {jobType.length + (searchTerm ? 1 : 0) + (location ? 1 : 0)}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Filters Sidebar */}
            <div className={`${showFilters ? "block" : "hidden"} lg:block lg:w-72 flex-shrink-0`}>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-600" />
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="font-medium mb-4 text-gray-900 text-sm uppercase tracking-wider">
                      Job Type
                    </h3>
                    <div className="space-y-3">
                      {backendJobTypes.map((type) => (
                        <label key={type} className="flex items-center cursor-pointer group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={jobType.includes(type)}
                              onChange={() => toggleJobType(type)}
                              className="peer sr-only"
                            />
                            <div className="h-5 w-5 border-2 border-gray-300 rounded transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-blue-400"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 pointer-events-none transform scale-50 peer-checked:scale-100 transition-all">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <span className="ml-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                            {typeLabels[type] || type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="flex-1 min-w-0">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isLoading ? "Searching..." : `Showing ${mappedJobs.length} Jobs`}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {!isLoading && "Based on your current preferences"}
                  </p>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-sm flex items-center font-medium">
                        "{searchTerm}"
                        <button
                          onClick={() => setRawSearchTerm("")}
                          className="ml-1.5 hover:bg-blue-100 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {location && (
                      <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1 text-sm flex items-center font-medium">
                        <MapPin className="h-3 w-3 mr-1" />
                        {location}
                        <button
                          onClick={() => setRawLocation("")}
                          className="ml-1.5 hover:bg-emerald-100 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {jobType.map((type) => (
                      <div
                        key={type}
                        className="bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-3 py-1 text-sm flex items-center font-medium"
                      >
                        {typeLabels[type] || type}
                        <button
                          onClick={() => toggleJobType(type)}
                          className="ml-1.5 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* States */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                  </div>
                  <p className="text-gray-500 mt-4 font-medium">Finding the best opportunities...</p>
                </div>
              )}

              {isError && (
                <div className="text-center py-16 bg-red-50/50 rounded-xl border border-red-100">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Unable to load jobs</h3>
                  <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
                    We encountered an issue fetching the job listings. Please check your connection and try again.
                  </p>
                  <Button onClick={() => refetch()} className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-blue-600">
                    Retry Search
                  </Button>
                </div>
              )}

              {!isLoading && !isError && mappedJobs.length > 0 && (
                <div className="space-y-4">
                  {mappedJobs.map((job, index) => (
                    <div
                      key={job.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <JobCard job={job} />
                    </div>
                  ))}
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                      You've reached the end of the list
                    </p>
                  </div>
                </div>
              )}

              {!isLoading && !isError && mappedJobs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="mx-auto w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <Briefcase className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-8">
                    We couldn't find any matches for your current filters. Try adjusting your search criteria.
                  </p>
                  <Button
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;