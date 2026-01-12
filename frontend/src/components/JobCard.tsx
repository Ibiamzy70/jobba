import React from "react";
import { MapPin, DollarSign, ArrowUpRight, Building2, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface Job {
  id: string | number;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  employment_type?: "full-time" | "part-time" | "contract" | "remote" | "internship";
  salary_min?: number;
  salary_max?: number;
  created_at?: string;
  description: string;
}

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  
  const formatEmploymentType = (type?: string) => {
    if (!type) return "Full-time"; 
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  
  const getTypeStyles = (type?: string) => {
    const normalized = type || "full-time";
    const styles: Record<string, string> = {
      "full-time": "bg-blue-50 text-blue-700 border-blue-200",
      "part-time": "bg-emerald-50 text-emerald-700 border-emerald-200",
      contract: "bg-amber-50 text-amber-700 border-amber-200",
      remote: "bg-indigo-50 text-indigo-700 border-indigo-200",
      internship: "bg-pink-50 text-pink-700 border-pink-200",
    };
    return styles[normalized] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    if (job.salary_min && job.salary_max) {
      return `₦${job.salary_min.toLocaleString()} – ₦${job.salary_max.toLocaleString()}`;
    }
    if (job.salary_min) return `From ₦${job.salary_min.toLocaleString()}`;
    if (job.salary_max) return `Up to ₦${job.salary_max.toLocaleString()}`;
    return null;
  };

  const formatPostedDate = () => {
    if (!job.created_at) return "Recently posted";
    const date = new Date(job.created_at);
    if (isNaN(date.getTime())) return "Recently posted";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300/50">
      <div className="p-6">
        <div className="flex items-start gap-5">
          {/* Company Logo / Fallback */}
          <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm overflow-hidden">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={`${job.company} logo`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <Building2 className={`h-7 w-7 ${job.company_logo ? "hidden" : ""}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {job.title || "Untitled Job"}
                </h3>
                <p className="text-gray-600 text-sm font-medium mt-1 flex items-center gap-1.5">
                  {job.company || "Company"}
                </p>
              </div>

              {/* Apply Button */}
              <Button
                asChild
                size="sm"
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform sm:translate-x-2 sm:group-hover:translate-x-0"
              >
                <Link to={`/jobs/${job.id}`}>
                  Apply Now
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>{job.location || "Location not specified"}</span>
              </div>
              {formatSalary() && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>{formatSalary()}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span>{formatPostedDate()}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-5 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeStyles(
                  job.employment_type
                )}`}
              >
                <Briefcase className="w-3 h-3 mr-1.5" />
                {formatEmploymentType(job.employment_type)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;