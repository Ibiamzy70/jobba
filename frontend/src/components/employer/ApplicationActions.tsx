import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Download, MessageSquare, CheckCircle2, UserCheck, XCircle, Briefcase, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useUpdateApplication } from "../../hooks/useApplications";

type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected";

interface ApplicationActionsProps {
  applicationId: number;
  currentStatus: ApplicationStatus;
  resumeUrl?: string;
  onStatusChange?: () => void;
}

const getStatusConfig = (status: ApplicationStatus) => {
  switch (status) {
    case "applied":
      return { label: "Applied", variant: "secondary" as const };
    case "under_review":
      return { label: "In Review", variant: "default" as const };
    case "shortlisted":
      return { label: "Shortlisted", variant: "outline" as const };
    case "interview":
      return { label: "Interview", variant: "default" as const };
    case "offer":
      return { label: "Offer Extended", variant: "default" as const };
    case "rejected":
      return { label: "Not Selected", variant: "destructive" as const };
    default:
      return { label: "Unknown", variant: "secondary" as const };
  }
};

export default function ApplicationActions({
  applicationId,
  currentStatus,
  resumeUrl,
  onStatusChange,
}: ApplicationActionsProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateApplication();

  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    if (newStatus === currentStatus) {
      toast({
        title: "No change",
        description: "Application is already in this status.",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: applicationId,
        payload: { status: newStatus },
      });

      const { label } = getStatusConfig(newStatus);
      toast({
        title: "Status Updated",
        description: `Application marked as "${label}"`,
      });

      onStatusChange?.();
    } catch {
      toast({
        title: "Update Failed",
        description: "Could not update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusConfig = getStatusConfig(currentStatus);

  const canMoveToReview = currentStatus === "applied";
  const canShortlist = currentStatus === "under_review" || currentStatus === "applied";
  const canScheduleInterview = currentStatus === "shortlisted";
  const canSendOffer = currentStatus === "interview";

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-3">
        {/* Resume Download */}
        {resumeUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" asChild>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4 mr-2" />
                  Resume
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download resume</TooltipContent>
          </Tooltip>
        )}

        {/* Employer Actions */}
        {canMoveToReview && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate("under_review")}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Move to Review
              </Button>
            </TooltipTrigger>
            <TooltipContent>Begin active evaluation</TooltipContent>
          </Tooltip>
        )}

        {canShortlist && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleStatusUpdate("shortlisted")}
                disabled={updateMutation.isPending}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Shortlist
              </Button>
            </TooltipTrigger>
            <TooltipContent>Strong candidate — advance to next stage</TooltipContent>
          </Tooltip>
        )}

        {canScheduleInterview && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleStatusUpdate("interview")}
                disabled={updateMutation.isPending}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </TooltipTrigger>
            <TooltipContent>Invite for interview</TooltipContent>
          </Tooltip>
        )}

        {canSendOffer && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleStatusUpdate("offer")}
                disabled={updateMutation.isPending}
              >
                Send Offer
              </Button>
            </TooltipTrigger>
            <TooltipContent>Extend job offer</TooltipContent>
          </Tooltip>
        )}

        {/* Reject Button — Always Available */}
        {currentStatus !== "rejected" && currentStatus !== "offer" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={updateMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </TooltipTrigger>
            <TooltipContent>Not a fit</TooltipContent>
          </Tooltip>
        )}

        {/* Message Applicant */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" disabled>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </TooltipTrigger>
          <TooltipContent>Messaging coming soon</TooltipContent>
        </Tooltip>

        {/* Current Status Badge */}
        <div className="ml-auto">
          <Badge variant={statusConfig.variant} className="px-4 py-2 text-base font-medium">
            {statusConfig.label}
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  );
}