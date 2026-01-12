import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, MapPin, Calendar, Send, Loader2 } from "lucide-react";
import { useApplications } from "../../hooks/useApplications";
import type { components } from "../../types/api-schema";

type Application = components["schemas"]["Application"];

interface AppliedJobsCardProps {
  profileId?: string | number;
  onViewDetails?: (id: number) => void;
  onViewAll?: () => void;
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  REVIEWED: { label: "Under Review", variant: "outline" },
  INTERVIEW: { label: "Interview", variant: "default" },
  ACCEPTED: { label: "Accepted", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export default function AppliedJobsCard({
  profileId,
  onViewDetails,
  onViewAll,
}: AppliedJobsCardProps) {
  // Fetch applications - limit to 5 most recent for dashboard view
  const { data, isLoading, isError, error } = useApplications({
    applicant: profileId,
    ordering: "-applied_at",
    page_size: 5,
  });

  const applications = data?.results || [];

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      // Fallback navigation - adjust to your routing setup
      window.location.href = "/applications";
    }
  };

  const handleViewDetails = (applicationId: number) => {
    if (onViewDetails) {
      onViewDetails(applicationId);
    } else {
      // Fallback navigation
      window.location.href = `/applications/${applicationId}`;
    }
  };

  return (
    <Card className="border-card-border h-fit" data-testid="card-applied-jobs">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Applied Jobs</CardTitle>
          {!isLoading && (
            <Badge variant="secondary" className="text-xs">
              {data?.count || 0}
            </Badge>
          )}
        </div>
        {!isLoading && applications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleViewAll}
            data-testid="link-view-all-applications"
          >
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 px-6">
            <div className="text-sm text-destructive">
              Failed to load applications
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Please try again later"}
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 px-6">
            <Send className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No applications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start applying to jobs to track your progress
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-1 px-4 pb-4">
              {applications.map((application) => {
                const status =
                  statusConfig[application.status] || statusConfig.PENDING;
                return (
                  <div
                    key={application.id}
                    className="p-3 rounded-lg hover-elevate border border-transparent hover:border-card-border transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(application.id)}
                    data-testid={`applied-job-${application.id}`}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 shrink-0 border border-card-border">
                        <AvatarImage
                          src={application.job_title || undefined}
                          alt={application.job_title || "Company"}
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {(application.job_title || "JB")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4
                              className="font-medium text-foreground text-sm truncate"
                              data-testid={`text-applied-position-${application.id}`}
                            >
                              {application.job_title || `Job #${application.job}`}
                            </h4>
                            {application.applicant_name && (
                              <p
                                className="text-xs text-muted-foreground truncate"
                                data-testid={`text-applied-company-${application.id}`}
                              >
                                {application.applicant_name}
                              </p>
                            )}
                          </div>
                          <Badge variant={status.variant} className="text-xs shrink-0">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          {application.applied_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Applied {formatDate(application.applied_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}