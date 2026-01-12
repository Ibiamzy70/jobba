import { useNavigate } from "react-router-dom"; 
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useApplications } from "../hooks/useApplications";
import { useAuthStore } from "../lib/auth";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../components/ui/tooltip";
import { Briefcase, Calendar, TrendingUp, AlertCircle, Building2 } from "lucide-react";

const getStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case "applied":
      return { label: "Applied", variant: "secondary" as const, tooltip: "Your application has been submitted" };
    case "under_review":
      return { label: "In Review", variant: "default" as const, tooltip: "Employer is reviewing your application" };
    case "shortlisted":
      return { label: "Shortlisted", variant: "outline" as const, tooltip: "You've been selected for further consideration" };
    case "interview":
      return { label: "Interview", variant: "default" as const, tooltip: "You've been invited to interview" };
    case "offer":
      return { label: "Offer Extended", variant: "default" as const, tooltip: "Congratulations! You've received a job offer" };
    case "rejected":
      return { label: "Not Selected", variant: "destructive" as const, tooltip: "This position has been filled by another candidate" };
    default:
      return { label: status.replace(/_/g, " "), variant: "secondary" as const, tooltip: "" };
  }
};

const getMatchLabel = (score: number | null) => {
  if (score === null) return "Analyzing resume...";
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Moderate match";
  return "Needs improvement";
};

const getMatchColor = (score: number | null) => {
  if (score === null) return "text-muted-foreground";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return "Today";
  if (diffHours < 24) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

export default function Applications() {
  const { user } = useAuthStore();
  const navigate = useNavigate(); // ← FIXED: useNavigate declared
  const { data, isLoading, isError, refetch } = useApplications({ applicant: user?.id });
  const apps = data?.results || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Loading your applications...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Failed to load applications</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't retrieve your applications. Please try again.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Briefcase className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-3xl font-bold mb-4">No applications yet</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your journey by applying to jobs that match your skills.
            </p>
            <Link to="/jobs">
              <Button size="lg">Browse Open Positions</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl font-bold">My Applications</h1>
              <p className="text-muted-foreground mt-3">
                Track your progress and AI-powered match insights
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Applications ({apps.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>AI Match</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apps.map((app) => {
                      const statusConfig = getStatusConfig(app.status);

                      return (
                        <TableRow
                          key={app.id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-b-0"
                          onClick={() => navigate(`/applications/${app.id}`)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {app.company_logo ? (
                                <img
                                  src={app.company_logo}
                                  alt={app.company_name}
                                  className="h-8 w-8 rounded object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                {app.job_title}
                                <p className="text-sm text-muted-foreground">{app.company_name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatRelativeDate(app.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {app.ai_match_score !== null ? (
                              <div className="flex items-center gap-2">
                                <TrendingUp className={`h-4 w-4 ${getMatchColor(app.ai_match_score)}`} />
                                <div>
                                  <span className={`font-semibold ${getMatchColor(app.ai_match_score)}`}>
                                    {Math.round(app.ai_match_score)}%
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    {getMatchLabel(app.ai_match_score)}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Analyzing resume...</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Badge variant={statusConfig.variant}>
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              {statusConfig.tooltip && (
                                <TooltipContent>
                                  <p>{statusConfig.tooltip}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/applications/${app.id}`);
                              }}
                            >
                              View Details →
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>AI match scores are based on resume and job description alignment</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
}