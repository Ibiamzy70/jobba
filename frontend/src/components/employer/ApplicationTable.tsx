import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import ApplicationActions from "./ApplicationActions";
import type { components } from "@/types/api-schema";
import { useQueryClient } from "@tanstack/react-query";

type Application = components["schemas"]["Application"];
type BackendApplicationStatus = Application["status"];


type FrontendApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected";

interface ApplicationTableProps {
  applications: Application[];
}


const mapToFrontendStatus = (backendStatus: BackendApplicationStatus): FrontendApplicationStatus => {
  switch (backendStatus) {
    case "PENDING":
      return "applied";
    case "REVIEWED":
      return "under_review";
    case "INTERVIEW":
      return "interview";
    case "REJECTED":
      return "rejected";
    case "ACCEPTED":
      return "offer";
  }
};

const STATUS_LABELS: Record<FrontendApplicationStatus, string> = {
  applied: "Applied",
  under_review: "In Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Offer Extended",
  rejected: "Not Selected",
};

const STATUS_COLORS: Record<FrontendApplicationStatus, string> = {
  applied: "bg-gray-100 text-gray-800",
  under_review: "bg-blue-100 text-blue-800",
  shortlisted: "bg-emerald-100 text-emerald-800",
  interview: "bg-purple-100 text-purple-800",
  offer: "bg-indigo-100 text-indigo-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ApplicationTable({ applications }: ApplicationTableProps) {
  const queryClient = useQueryClient();

  const handleStatusChange = () => {
    
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Job</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>AI Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                <div className="space-y-3">
                  <div className="text-lg font-medium">No applications received yet</div>
                  <p className="text-sm">Applications will appear here once candidates apply.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => {
              const frontendStatus = mapToFrontendStatus(app.status);
              
              return (
                <TableRow key={app.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {app.applicant_avatar ? (
                        <img
                          src={app.applicant_avatar}
                          alt={app.applicant_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {app.applicant_name?.[0] || "A"}
                        </div>
                      )}
                      <div>
                        <div>{app.applicant_name || "Unnamed Applicant"}</div>
                        <div className="text-sm text-muted-foreground">{app.applicant_email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.job_title}</div>
                      <div className="text-sm text-muted-foreground">{app.company_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(app.created_at)}</TableCell>
                  <TableCell>
                    {app.ai_match_score !== null ? (
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{Math.round(app.ai_match_score)}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              app.ai_match_score >= 80
                                ? "bg-emerald-500"
                                : app.ai_match_score >= 60
                                ? "bg-blue-500"
                                : app.ai_match_score >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${app.ai_match_score}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Analyzing...</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_COLORS[frontendStatus]} px-3 py-1`}>
                      {STATUS_LABELS[frontendStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/applications/${app.id}`} aria-label="View application details">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      <ApplicationActions
                        applicationId={app.id}
                        currentStatus={frontendStatus}
                        resumeUrl={app.resume}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}