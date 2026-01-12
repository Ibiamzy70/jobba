import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../lib/auth";
import { axiosInstance } from "../lib/auth";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ThemeToggle } from "../components/ThemeToggle";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import ExperienceCard from "../components/profile/ExperienceCard";
import EducationCard from "../components/profile/EducationCard";
import SkillsCard from "../components/profile/SkillsCard";
import PortfolioCard from "../components/profile/PortfolioCard";
import JobOffersCard from "../components/profile/JobOffersCard";
import MessagesCard from "../components/profile/MessagesCard";
import NotificationsCard from "../components/profile/NotificationsCard";
import ProfileCompletionCard from "../components/profile/ProfileCompletionCard";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const jobOffersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("[Profile] Checking onboarding for user:", user);
    
    // Only check onboarding for applicants
    if (!user) {
      console.log("[Profile] No user found, redirecting to login");
      navigate("/login");
      return;
    }

    if (user.role !== "applicant") {
      console.log("[Profile] User is employer or other role, skipping onboarding check");
      setIsCheckingOnboarding(false);
      setHasCompletedOnboarding(true); 
      return;
    }

    console.log("[Profile] User is applicant/job_seeker, checking onboarding status...");
    
    // Helper function to check if profile is actually complete
    const isProfileComplete = (profileData: any) => {
      // Check if essential fields are filled (not just empty strings)
      const essentialFields = [
        profileData.first_name,
        profileData.last_name,
        profileData.phone,
        profileData.location,
        profileData.bio,
      ];
      
      // Profile is complete if all essential fields have actual values
      return essentialFields.every(field => field && field.trim() !== '');
    };
    
    // Check if user has completed onboarding
    const checkOnboarding = async () => {
      try {
        console.log("[Profile] Fetching /applicant/profile/");
        const response = await axiosInstance.get("/applicant/profile/");
        console.log("[Profile] Response:", response);
        console.log("[Profile] Response data:", response.data); 
        console.log("[Profile] Onboarding completed?:", response.data.onboarding_completed); 
        
        // Check if profile data actually exists
        if (!response.data || Object.keys(response.data).length === 0) {
          console.log("[Profile] No profile data, redirecting to onboarding");
          navigate("/onboarding", { replace: true });
          return;
        }
        
        // Check if profile is actually complete (not just existing with defaults)
        if (!isProfileComplete(response.data)) {
          console.log("[Profile] Profile exists but incomplete, redirecting to onboarding");
          navigate("/onboarding", { replace: true });
          return;
        }
        
        console.log("[Profile] Profile exists and is complete, showing profile page");
        

        if (!response.data.onboarding_completed) {
          console.log("[Profile] Onboarding not completed, redirecting to onboarding");
          navigate("/onboarding", { replace: true });
          return;
        }
    
        console.log("[Profile] Onboarding completed, showing profile page");
        
        setHasCompletedOnboarding(true);
        setIsCheckingOnboarding(false);
      } catch (error: any) {
        console.log("[Profile] Error response:", error.response);
        
        if (error.response?.status === 404) {
          console.log("[Profile] 404 detected, redirecting to onboarding");
          navigate("/onboarding", { replace: true });
        } else {
          
          console.error("[Profile] Error checking onboarding:", error);
          setHasCompletedOnboarding(true); 
          setIsCheckingOnboarding(false);
        }
      }
    };

    checkOnboarding();
  }, [user, navigate]);

  // Scroll to JobOffersCard when navigated with resume-upload state
  useEffect(() => {
    if (location.state?.scrollTo === "resume-upload" && jobOffersRef.current && hasCompletedOnboarding) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        jobOffersRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }, 100);
    }
  }, [location.state, hasCompletedOnboarding]);

  
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0A66C2] mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  
  if (!user || !hasCompletedOnboarding) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
            <ThemeToggle />
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              <PersonalInfoCard />
              <ExperienceCard />
              <EducationCard />
              <SkillsCard />
              <PortfolioCard />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <ProfileCompletionCard />
              <div ref={jobOffersRef}>
                <JobOffersCard />
              </div>
              <MessagesCard />
              <NotificationsCard />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}