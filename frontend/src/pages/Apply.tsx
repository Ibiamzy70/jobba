import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useJob } from "../hooks/useJobs";
import { useCreateApplication } from "../hooks/useApplications";
import { useAuthStore } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Upload, FileText, Briefcase, Building2, MapPin, DollarSign } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: job, isLoading: jobLoading } = useJob(id);
  const createMutation = useCreateApplication();
  const { toast } = useToast();

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({
        title: "Invalid file type",
        description: "Only PDF resumes are accepted",
        variant: "destructive",
      });
      return;
    }
    setResumeFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 1) {
      toast({
        title: "Multiple files detected",
        description: "Please upload only one resume",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 1) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume to continue",
        variant: "destructive",
      });
      return;
    }

    const fd = new FormData();
    fd.append("job_id", id!);
    fd.append("cover_letter", coverLetter);
    fd.append("resume", resumeFile);

    try {
      await createMutation.mutateAsync(fd);
      toast({
        title: "Application submitted!",
        description: "Your application has been successfully sent.",
      });
      navigate("/applications"); // ← SPA-friendly navigation
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit application. Please try again.";

      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return "Salary not disclosed";
    if (job.salary_min && job.salary_max) {
      return `₦${job.salary_min.toLocaleString()} – ₦${job.salary_max.toLocaleString()}`;
    }
    if (job.salary_min) return `From ₦${job.salary_min.toLocaleString()}`;
    if (job.salary_max) return `Up to ₦${job.salary_max.toLocaleString()}`;
    return "Negotiable";
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The job posting you're trying to apply for is no longer available.
            </p>
            <Link to="/jobs">
              <Button>Browse Open Jobs</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link to={`/jobs/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Job Listing
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Summary Sidebar */}
            <div className="order-2 lg:order-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Job Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <p className="text-muted-foreground mt-1">{job.company}</p>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{job.job_type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {formatSalary()}
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center pt-2">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      {job.applications_count || 0} applicants
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Application Form */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Application</CardTitle>
                  <p className="text-muted-foreground">
                    Fill in your details and upload your resume to apply
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                      <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                      <Textarea
                        id="cover-letter"
                        placeholder="Tell us why you're the perfect candidate for this role..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="min-h-48 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Resume *</Label>
                      <div
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ${
                          isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/30 hover:border-primary/50"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {resumeFile ? (
                          <div className="space-y-4">
                            <FileText className="h-16 w-16 mx-auto text-primary" />
                            <div>
                              <p className="font-medium text-lg">{resumeFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="flex justify-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setResumeFile(null)}
                              >
                                Change File
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
                            <div>
                              <p className="text-lg font-medium">
                                <span className="text-primary underline cursor-pointer">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                PDF only • Maximum 10MB
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              id="resume-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileChange(file);
                              }}
                            />
                            <label htmlFor="resume-upload">
                              <Button type="button" variant="secondary">
                                Select Resume
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <Button type="button" variant="outline" asChild>
                        <Link to={`/jobs/${id}`}>Cancel</Link>
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || !resumeFile}
                        className="min-w-40"
                      >
                        {createMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </div>
                  </form>
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