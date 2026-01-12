import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/auth";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import ExperienceCard from "../components/profile/ExperienceCard";
import EducationCard from "../components/profile/EducationCard";
import SkillsCard from "../components/profile/SkillsCard";
import PortfolioCard from "../components/profile/PortfolioCard";

import { Loader2 } from "lucide-react";

export default function ViewProfilePage() {
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Validate applicantId first
    if (!applicantId || isNaN(Number(applicantId))) {
      console.error("Invalid applicantId param", applicantId);
      setError(true);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(
          `/employers/applicants/${applicantId}/profile/`
        );
        console.log(" Profile data received:", res.data);
        setProfile(res.data);
      } catch (err) {
        console.error("[ViewProfile] Failed to load profile", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [applicantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Profile Not Found</h2>
            <p className="text-muted-foreground">
              Unable to load the applicant's profile.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="text-primary hover:underline"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Applicant Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              <PersonalInfoCard readOnly data={profile} />
              <ExperienceCard readOnly data={profile.experience} />
              <EducationCard readOnly data={profile.education} />
              <SkillsCard readOnly data={profile.skills} />
              <PortfolioCard readOnly items={profile.portfolio} />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* intentionally empty / future employer actions */}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}