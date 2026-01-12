import { useState, useEffect, useMemo } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useAuthStore } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge"; 
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../components/ui/tooltip";
import { Link } from "react-router-dom";
import { Bell, Users, Briefcase, TrendingUp, AlertCircle, Search, ArrowUpRight, Sparkles } from "lucide-react"; 
import { useToast } from "../hooks/use-toast";
import { useEmployerProfile } from "../hooks/use-employer-profile";
import { useJobs } from "../hooks/useJobs";
import { useApplications } from "../hooks/useApplications";
import { useNotifications } from "../hooks/useNotifications";
import JobTable from "../components/employer/JobTable";
import ApplicationTable from "../components/employer/ApplicationTable";
import AnalyticsChart from "../components/employer/AnalyticsChart";
import NotificationsPanel from "../components/employer/NotificationsPanel";
import ProfileEditDialog from "../components/employer/ProfileEditDialog";

type DateRange = "7d" | "30d" | "90d" | "all";

export default function EmployerDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [showApplications, setShowApplications] = useState(true);
  const [showViews, setShowViews] = useState(true);

  // Separate filters
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatus, setJobStatus] = useState("all");
  const [appSearch, setAppSearch] = useState("");
  const [appStatus, setAppStatus] = useState("all");

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useEmployerProfile();

  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
  } =  useJobs({ owner_id: user?.id });

  const {
    data: applicationsData,
    isLoading: appsLoading,
    error: appsError,
  } = useApplications({ owner_id: user?.id })

  const { data: notificationsData } = useNotifications();

  const jobs = jobsData?.results ?? [];
  const applications = applicationsData?.results ?? [];
  const notifications = notificationsData?.results ?? [];

  // ← MEMOIZED: Safe derived stats
  const stats = useMemo(() => {
    const totalViews = jobs.reduce((acc, j) => acc + (j.views_count || 0), 0);

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.is_active).length,
      totalApplications: applications.length,
      pendingReviews: applications.filter((a) => a.status === "PENDING").length,
      avgApplicantsPerJob: jobs.length ? applications.length / jobs.length : 0,
      totalViews,
      conversionRate: totalViews > 0 ? ((applications.length / totalViews) * 100).toFixed(1) + "%" : "0%",
    };
  }, [jobs, applications]);

  // ← MEMOIZED: Filtered data
  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(jobSearch.toLowerCase()) &&
          (jobStatus === "all" || (jobStatus === "active" ? job.is_active : !job.is_active))
      ),
    [jobs, jobSearch, jobStatus]
  );

  const filteredApplications = useMemo(
    () =>
      applications.filter((app) => {
        const matchesSearch =
          (app.applicant_name || "").toLowerCase().includes(appSearch.toLowerCase()) ||
          (app.job_title || "").toLowerCase().includes(appSearch.toLowerCase());
        const matchesStatus = appStatus === "all" || app.status === appStatus.toUpperCase();
        return matchesSearch && matchesStatus;
      }),
    [applications, appSearch, appStatus]
  );

  // Mock analytics with date range simulation
  const analyticsData = useMemo(() => {
    const base = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      applications: [65, 59, 80, 81, 56, 55],
      views: [280, 480, 400, 190, 860, 270],
    };

    if (dateRange === "7d") {
      return {
        labels: base.labels.slice(-2),
        applications: base.applications.slice(-2),
        views: base.views.slice(-2),
      };
    }
    if (dateRange === "30d") {
      return {
        labels: base.labels.slice(-4),
        applications: base.applications.slice(-4),
        views: base.views.slice(-4),
      };
    }
    return base;
  }, [dateRange]);

  useEffect(() => {
    if (profile?.verification_status === "pending") {
      toast({
        title: "Profile Verification Pending",
        description: "Your company profile is under review. Some features may be limited.",
      });
    }
  }, [profile, toast]);

  const hasError = profileError || jobsError || appsError;
  const isLoading = profileLoading || jobsLoading || appsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
           <p className="text-muted-foreground font-medium">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <Card className="max-w-md w-full shadow-2xl border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Connection Interrupted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              We encountered an issue loading your dashboard data. This is usually a temporary connectivity glitch.
            </p>
            <Button className="w-full" onClick={() => window.location.reload()}>Reload Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <NavBar />
        
        {/* Main Content Area with Subtle Gradient Background */}
        <main className="flex-1 py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
          {/* Decorative Background Blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70 animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />

          <div className="container max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employer Dashboard</h1>
                    <Badge variant="secondary" className="hidden sm:inline-flex bg-blue-50 text-blue-700 border-blue-100">Pro</Badge>
                </div>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {profile?.company_name || "Your Company"} 
                  <span className="text-slate-300">•</span> 
                  {profile?.industry || "Industry"}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                <Button 
                    variant="outline" 
                    onClick={() => setIsProfileDialogOpen(true)} 
                    className="bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm border-slate-200"
                >
                  <Users className="mr-2 h-4 w-4 text-slate-500" /> Edit Profile
                </Button>
                
                <Link to="/post-job" className="flex-1 lg:flex-none">
                  <Button className="w-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
                    <Sparkles className="mr-2 h-4 w-4" /> Post New Job
                  </Button>
                </Link>
                
                <div className="border-l pl-3 ml-1 border-slate-200">
                    <NotificationsPanel notifications={notifications} />
                </div>
              </div>
            </div>

            {/* Stats Grid - "Bento Box" Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg border-l-4 border-l-blue-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Briefcase className="w-16 h-16 text-blue-600" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-slate-900">{stats.totalJobs}</div>
                  <p className="text-xs text-muted-foreground mt-1">Lifetime postings</p>
                </CardContent>
              </Card>

              <Card className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg border-l-4 border-l-green-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-16 h-16 text-green-600" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-slate-900">{stats.activeJobs}</div>
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                    Currently visible
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg border-l-4 border-l-purple-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-16 h-16 text-purple-600" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-slate-900">{stats.totalApplications}</div>
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    {stats.pendingReviews} pending review
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg border-l-4 border-l-orange-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertCircle className="w-16 h-16 text-orange-600" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    Conversion
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="h-3 w-3 text-slate-400 hover:text-slate-600 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-slate-900 text-white border-0">
                        <p className="max-w-xs text-xs">Applications divided by total job views</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-slate-900">{stats.conversionRate}</div>
                  <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: stats.conversionRate }} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="bg-white/50 backdrop-blur-md p-1 rounded-xl border border-white/20 inline-flex shadow-sm">
                <TabsList className="bg-transparent h-auto p-0 gap-1">
                  {["overview", "jobs", "applications", "analytics"].map((tab) => (
                      <TabsTrigger 
                        key={tab}
                        value={tab} 
                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:font-semibold text-muted-foreground transition-all duration-300 capitalize"
                      >
                        {tab}
                      </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Applications - Takes up 2/3 width on large screens */}
                    <Card className="lg:col-span-2 border-none shadow-md bg-white/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold">Recent Applications</CardTitle>
                        <Button variant="ghost" size="sm" className="text-primary" asChild>
                            <Link to="/applications">View All <ArrowUpRight className="ml-1 w-4 h-4"/></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {filteredApplications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                <Users className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-lg font-medium text-slate-600">No applications yet</p>
                            <p className="text-sm text-slate-400 max-w-sm mt-1 mb-4">
                                Once candidates apply to your posted jobs, they will appear here instantly.
                            </p>
                            <Link to="/post-job">
                                <Button variant="outline">Post a Job</Button>
                            </Link>
                        </div>
                        ) : (
                        <div className="space-y-4">
                             {/* Styling wrapper for table to ensure it looks clean */}
                             <div className="rounded-md border border-slate-100 overflow-hidden">
                                <ApplicationTable applications={filteredApplications.slice(0, 5)} />
                             </div>
                        </div>
                        )}
                    </CardContent>
                    </Card>

                    {/* Quick Actions - Takes up 1/3 width */}
                    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                    <Button 
                      asChild 
                      className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-lg group"
                    >
                      <Link to="/post-job">
                        <Briefcase className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Post New Job</span>
                      </Link>
                    </Button>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all" asChild>
                                <Link to="/talent-search">
                                    <Search className="h-6 w-6" />
                                    <span className="text-xs font-medium">Search Talent</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-24 flex-col gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all" onClick={() => setActiveTab("analytics")}>
                                <TrendingUp className="h-6 w-6" />
                                <span className="text-xs font-medium">Analytics</span>
                            </Button>
                        </div>
                    </CardContent>
                    </Card>
                </div>
              </TabsContent>

              {/* JOBS TAB */}
              <TabsContent value="jobs" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <CardTitle>Job Management</CardTitle>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title..."
                                value={jobSearch}
                                onChange={(e) => setJobSearch(e.target.value)}
                                className="pl-9 w-full md:w-64 bg-white"
                            />
                        </div>
                      <Select value={jobStatus} onValueChange={setJobStatus}>
                        <SelectTrigger className="w-full md:w-[160px] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 p-0">
                    <JobTable jobs={filteredJobs} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* APPLICATIONS TAB */}
              <TabsContent value="applications" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <CardTitle>Applicant Tracking</CardTitle>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Candidate or job title..."
                                    value={appSearch}
                                    onChange={(e) => setAppSearch(e.target.value)}
                                    className="pl-9 w-full md:w-64 bg-white"
                                />
                            </div>
                            <Select value={appStatus} onValueChange={setAppStatus}>
                                <SelectTrigger className="w-full md:w-[160px] bg-white">
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="interview">Interview</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                  <CardContent className="pt-0 p-0">
                    <ApplicationTable applications={filteredApplications} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
                    <p className="text-muted-foreground mt-1">Deep dive into your recruitment funnel metrics</p>
                  </div>
                  
                  <div className="bg-white p-2 rounded-lg border shadow-sm flex flex-wrap gap-3 items-center">
                    <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                      <SelectTrigger className="w-[150px] border-0 focus:ring-0 shadow-none bg-transparent font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="h-6 w-px bg-slate-200 mx-1" />

                    <div className="flex gap-1">
                      <Button
                        variant={showApplications ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setShowApplications(!showApplications)}
                        className={`text-xs ${showApplications ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : ''}`}
                      >
                        Applications
                      </Button>
                      <Button
                        variant={showViews ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setShowViews(!showViews)}
                        className={`text-xs ${showViews ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}`}
                      >
                        Views
                      </Button>
                    </div>
                  </div>
                </div>

                <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-500 font-medium">
                      {dateRange === "7d" ? "Trends: Last 7 days" :
                       dateRange === "30d" ? "Trends: Last 30 days" :
                       dateRange === "90d" ? "Trends: Last 90 days" :
                       "Trends: All time"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <AnalyticsChart
                      data={{
                        labels: analyticsData.labels,
                        applications: showApplications ? analyticsData.applications : [],
                        views: showViews ? analyticsData.views : [],
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />

        <ProfileEditDialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
          profile={profile!}
        />
      </div>
    </TooltipProvider>
  );
}