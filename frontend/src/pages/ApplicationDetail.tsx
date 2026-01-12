import { useParams, Link, useNavigate } from "react-router-dom";
import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useApplication, useUpdateApplication } from "../hooks/useApplications";
import { useAuthStore } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Download,
  User,
  Building2,
  TrendingUp,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  UserCheck,
  XCircle,
  Briefcase,
} from "lucide-react";


const normalizeStatus = (status: string): ApplicationStatus => {
  const map: Record<string, ApplicationStatus> = {
    PENDING: "applied",
    REVIEWED: "under_review",
    SHORTLISTED: "shortlisted",
    INTERVIEW: "interview",
    ACCEPTED: "offer",
    REJECTED: "rejected",
  };
  return map[status.toUpperCase()] || "applied";
};

type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "applied": return { label: "Applied", variant: "secondary" as const };
    case "under_review": return { label: "In Review", variant: "default" as const };
    case "shortlisted": return { label: "Shortlisted", variant: "outline" as const };
    case "interview": return { label: "Interview Scheduled", variant: "default" as const };
    case "offer": return { label: "Offer Extended", variant: "default" as const };
    case "rejected": return { label: "Not Selected", variant: "destructive" as const };
    default: return { label: status.replace(/_/g, " "), variant: "secondary" as const };
  }
};

const getMatchDescription = (score: number | null) => {
  if (score === null) return "Resume analysis in progress";
  if (score >= 80) return "Excellent match — highly recommended";
  if (score >= 60) return "Good fit for the role";
  if (score >= 40) return "Moderate alignment";
  return "Limited match — may require further review";
};

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [showFullEmail, setShowFullEmail] = React.useState(false);
  const navigate = useNavigate();

  const { data: app, isLoading, isError } = useApplication(id);
  const updateMutation = useUpdateApplication();

  React.useEffect(() => {
    if (app) {
      console.log("=== APPLICATION DATA ===");
      console.log("Full app object:", app);
      console.log("app.applicant:", app.applicant);
      console.log("Type of app.applicant:", typeof app.applicant);
      console.log("=======================");
    }
  }, [app]);


  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    if (!app) return;

    try {
      await updateMutation.mutateAsync({
        id: app.id,
        payload: { status: newStatus },
      });

      toast({
        title: "Status Updated",
        description: `Application is now "${getStatusBadge(newStatus).label}"`,
      });
      window.location.reload();
    } catch {
      toast({
        title: "Update Failed",
        description: "Could not update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-10 w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-12 w-96" />
                <Skeleton className="h-8 w-64" />
                <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
              </div>
              <div className="space-y-6">
                <Card><CardHeader><Skeleton className="h-8 w-32" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The application you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link to="/applications">Back to Applications</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isEmployerOwner = user?.role === "employer" && 
  (typeof app.job === "object" && app.job.owner_id === user?.id);

  const currentStatus = normalizeStatus(app.status);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/applications">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applications
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-bold">{app.job_title}</h1>
                <p className="text-xl text-muted-foreground mt-2 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {app.company_name}
                </p>
              </div>

              {/* AI Match Score */}
              {app.ai_match_score !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      AI Match Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-4 mb-4">
                      <div className="text-5xl font-bold">{Math.round(app.ai_match_score)}%</div>
                      <div className="flex-1">
                        <Progress value={app.ai_match_score} className="h-6" />
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      {getMatchDescription(app.ai_match_score)}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Cover Letter */}
              <Card>
                <CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {app.cover_letter ? (
                      <p className="whitespace-pre-wrap">{app.cover_letter}</p>
                    ) : (
                      <p className="italic">No cover letter submitted.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resume */}
              {app.resume && (
                <Card>
                  <CardHeader><CardTitle>Resume</CardTitle></CardHeader>
                  <CardContent>
                    <Button asChild variant="secondary">
                      <a href={app.resume} target="_blank" rel="noopener noreferrer" download>
                        <Download className="mr-2 h-4 w-4" />
                        Download Resume
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
<div className="space-y-6">

  {/* Applicant Info */}
  <Card
  onClick={() => {
  let applicantId: number | null = null;

  if (app && app.applicant) {
    if (typeof app.applicant === "number") {
      applicantId = app.applicant;
    } else if (typeof app.applicant === "object" && "id" in app.applicant) {
      applicantId = app.applicant.id;
    }
  }

  if (!applicantId) {
    console.error("No valid applicant ID found!", app?.applicant);
    toast({
      title: "Error",
      description: "Unable to determine applicant ID",
      variant: "destructive",
    });
    return;
  }

  navigate(`/employers/applicants/${applicantId}/profile/`);
}}

  className="cursor-pointer hover:shadow-md transition-shadow"
>
    <CardHeader>
      <CardTitle>Applicant</CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 flex-shrink-0">
          <AvatarImage
            src={app.applicant_avatar}
            alt={app.applicant_name}
          />
          <AvatarFallback className="text-2xl">
            {app.applicant_name?.[0] || "A"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-xl truncate">
            {app.applicant_name}
          </h3>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullEmail(!showFullEmail);
            }}
            className="text-muted-foreground flex items-center gap-2 mt-1 min-w-0 w-full text-left hover:text-foreground transition-colors group"
          >
            <Mail className="h-4 w-4 flex-shrink-0 group-hover:text-primary" />
            <span className={showFullEmail ? "break-all" : "truncate"}>
              {app.applicant_email}
            </span>
          </button>
        </div>
      </div>
    </CardContent>
  </Card>


              {/* Current Status + Action Buttons — WILL SHOW BUTTONS */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <Badge className="text-lg px-8 py-3">
                      {currentStatus.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {isEmployerOwner && (
                    <div className="grid gap-3">
                      {currentStatus === "applied" && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate("under_review")}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                          Move to Review
                        </Button>
                      )}

                      {(currentStatus === "applied" || currentStatus === "under_review") && (
                        <>
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleStatusUpdate("shortlisted")}
                            disabled={updateMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Shortlist
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleStatusUpdate("rejected")}
                            disabled={updateMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {currentStatus === "shortlisted" && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleStatusUpdate("interview")}
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          Schedule Interview
                        </Button>
                      )}

                      {currentStatus === "interview" && (
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => handleStatusUpdate("offer")}
                        >
                          Send Offer
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}