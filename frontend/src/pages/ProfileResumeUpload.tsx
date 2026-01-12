import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  Loader2,
  ArrowRight,
  Target,  
  Zap, 
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../lib/auth";
import { useUploadResume } from "../hooks/use-upload-resume"; 

const ResumeUploadPage = memo(function ResumeUploadPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore(); 

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const uploadMutation = useUploadResume();

  const hasResume = !!user?.applicant_profile?.cv;

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setFileError(null);
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setFileError(null);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setFileError("Only PDF or Word documents are allowed");
      return false;
    }
    if (file.size > maxSize) {
      setFileError("File must be smaller than 10MB");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      // Error already handled in mutation
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
  };

  const goToDashboard = () => navigate("/profile");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white pb-12">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white/20 backdrop-blur rounded-3xl">
                <FileText className="h-12 w-12" />
              </div>
              <div className="pt-2">
                <CardTitle className="text-4xl font-bold">Your Resume</CardTitle>
                <CardDescription className="text-white/90 text-lg mt-3 max-w-2xl">
                  Upload your resume to unlock personalized AI job recommendations, higher match scores, and seamless applications.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-12 pb-16 px-10">
            {hasResume ? (
              <div className="text-center space-y-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle2 className="h-32 w-32 text-emerald-500 mx-auto drop-shadow-lg" />
                </motion.div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">Resume uploaded successfully!</h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Your AI-powered job recommendations are now fully personalized based on your experience and skills.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10">
                  <Button
                    size="lg"
                    onClick={goToDashboard}
                    className="px-10 py-7 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl hover:shadow-emerald-500/30"
                  >
                    <Sparkles className="h-6 w-6 mr-3" />
                    View My Profile
                    <ArrowRight className="h-5 w-5 ml-3" />
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="px-8 py-7 text-lg"
                  >
                    Replace Resume
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Sparkles,
                      title: "AI-Powered Matches",
                      desc: "Get job suggestions tailored to your skills and experience",
                    },
                    {
                      icon: Target,
                      title: "Stand Out",
                      desc: "Higher match scores with employers using AI insights",
                    },
                    {
                      icon: Zap,
                      title: "Faster Applications",
                      desc: "Apply instantly with your pre-filled profile data",
                    },
                  ].map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="text-center space-y-4"
                    >
                      <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                        <benefit.icon className="h-8 w-8 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-4 border-dashed rounded-3xl p-16 transition-all duration-300 text-center cursor-pointer ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-50/70 shadow-2xl shadow-indigo-500/20"
                      : "border-gray-300 bg-gray-50/70 hover:border-indigo-400"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload resume"
                  />

                  <div className="space-y-6">
                    <motion.div
                      animate={{ scale: dragActive ? 1.1 : 1 }}
                      className="inline-block p-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl shadow-xl"
                    >
                      <Upload className="h-20 w-20 text-indigo-600" />
                    </motion.div>

                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        Drop your resume here, or{" "}
                        <span className="text-indigo-600 underline hover:text-indigo-700">
                          browse
                        </span>
                      </p>
                      <p className="text-muted-foreground mt-3">
                        Supports PDF, DOC, DOCX • Maximum 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {fileError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}

                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border bg-card p-8 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl">
                          <FileText className="h-12 w-12 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{selectedFile.name}</p>
                          <p className="text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={removeFile} disabled={uploadMutation.isPending}>
                        <X className="h-6 w-6" />
                      </Button>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="w-full py-8 text-lg font-bold rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-2xl hover:shadow-purple-500/40 transition-all duration-300"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="h-7 w-7 mr-4 animate-spin" />
                          Analyzing Your Resume...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-7 w-7 mr-4" />
                          Upload Resume & Activate AI Matching
                        </>
                      )}
                    </Button>

                    {uploadMutation.isError && (
                      <Alert variant="destructive" className="mt-6">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDescription>
                          {(uploadMutation.error as any)?.message ||
                            "Upload failed. Please check your file and try again."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

export default ResumeUploadPage;