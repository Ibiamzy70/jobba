import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import EmployerDashboard from "./pages/EmployerDashboard"; 
import EmployerJobs from "./pages/EmployerJobs"; 
import JobForm from "./pages/JobForm";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import ApplyPage from "./pages/Apply";
import ResumeUploadPage from "./pages/ProfileResumeUpload"
import ViewProfilePage from "./pages/ViewProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/apply/:id" element={<ApplyPage />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} /> 
          <Route path="/dashboard/jobs" element={<EmployerJobs />} /> 
          <Route path="/post-job" element={<JobForm />} /> 
          <Route path="/dashboard/jobs/:id/edit" element={<JobForm />} />
          <Route path="/upload-resume" element={<ResumeUploadPage />} />
          <Route path="/employers/applicants/:applicantId/profile" element={<ViewProfilePage />} />
          
         
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;