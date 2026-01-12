// src/components/ProfileCompletionCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/use-personalinfo";
import { useExperiences } from "../../hooks/use-experiences";
import { useEducations } from "../../hooks/use-educations";
import { usePortfolio } from "../../hooks/use-portfolio";
import { useSkills } from "../../hooks/use-skills";

interface CompletionItem {
  id: string;
  label: string;
  isComplete: boolean;
  weight: number;
  icon: React.ReactNode;
  navigateTo?: string;
}

export default function ProfileCompletionCard() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: expData } = useExperiences({ profile: profile?.id });
  const { data: eduData } = useEducations({ profile: profile?.id });
  const { data: portfolioData } = usePortfolio({ profile: profile?.id });
  const { data: skillsData } = useSkills({ profile: profile?.id });

  const experiences = expData?.results || [];
  const educations = eduData?.results || [];
  const portfolioItems = portfolioData?.results || [];
  const skills = skillsData?.results || [];

  const completionItems: CompletionItem[] = [
    {
      id: "basic-info",
      label: "Basic info",
      isComplete: !!(profile?.first_name && profile?.last_name && profile?.email),
      weight: 15,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile",
    },
    {
      id: "headline",
      label: "Headline",
      isComplete: !!(profile?.headline && profile.headline.length > 10),
      weight: 10,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile",
    },
    {
      id: "bio",
      label: "Bio (50+ chars)",
      isComplete: !!(profile?.bio && profile.bio.length > 50),
      weight: 10,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile",
    },
    {
      id: "location",
      label: "Location",
      isComplete: !!profile?.location,
      weight: 5,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile",
    },
    {
      id: "phone",
      label: "Phone number",
      isComplete: !!profile?.phone,
      weight: 5,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile",
    },
    {
      id: "avatar",
      label: "Profile picture",
      isComplete: !!profile?.avatar_url,
      weight: 10,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile",
    },
    {
      id: "experience",
      label: "Work experience",
      isComplete: experiences.length >= 1,
      weight: 15,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile/experience",
    },
    {
      id: "education",
      label: "Education",
      isComplete: educations.length >= 1,
      weight: 10,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile/education",
    },
    {
      id: "skills",
      label: "Skills (3+)",
      isComplete: skills.length >= 3,
      weight: 10,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile/skills",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      isComplete: portfolioItems.length >= 1,
      weight: 10,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile/portfolio",
    },
    {
      id: "social-links",
      label: "Social links",
      isComplete: !!(profile?.linkedin_url || profile?.github_url || profile?.portfolio_url),
      weight: 5,
      icon: <CheckCircle2 className="h-4 w-4" />,
      navigateTo: "/profile",
    },
  ];

  const completedWeight = completionItems
    .filter(i => i.isComplete)
    .reduce((sum, i) => sum + i.weight, 0);

  const completionPercentage = Math.round(completedWeight);
  const completedCount = completionItems.filter(i => i.isComplete).length;

  const getStatus = () => {
    if (completionPercentage >= 95) return { text: "Complete!", color: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" };
    if (completionPercentage >= 80) return { text: "Excellent", color: "text-green-600", badge: "bg-green-100 text-green-700" };
    if (completionPercentage >= 60) return { text: "Good", color: "text-yellow-600", badge: "bg-yellow-100 text-yellow-700" };
    return { text: "Needs work", color: "text-orange-600", badge: "bg-orange-100 text-orange-700" };
  };

  const status = getStatus();

  return (
    <Card className="h-fit overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-4">
            <div
              className="relative h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-2xl"
              aria-label={`Profile completion: ${completionPercentage}%`}
            >
              {completionPercentage}%
            </div>
            Profile Strength
          </CardTitle>
          <Badge className={`${status.badge} font-bold text-sm px-4 py-2`}>
            {status.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{completedCount} of {completionItems.length} completed</span>
            <span className={`font-bold text-2xl ${status.color}`}>
              {completionPercentage}% Complete
            </span>
          </div>
          <Progress value={completionPercentage} className="h-5 rounded-full" />
        </div>

        <div className="space-y-4">
          {completionItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 text-sm p-4 rounded-2xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                item.isComplete 
                  ? "bg-emerald-50/70 hover:bg-emerald-50" 
                  : "bg-muted/70 hover:bg-muted"
              } ${item.navigateTo ? "hover:shadow-lg" : ""}`}
              onClick={() => item.navigateTo && navigate(item.navigateTo)}
              role={item.navigateTo ? "button" : undefined}
              tabIndex={item.navigateTo ? 0 : undefined}
              onKeyDown={(e) => item.navigateTo && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), navigate(item.navigateTo))}
            >
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  item.isComplete 
                    ? "bg-emerald-100 text-emerald-600" 
                    : "bg-muted text-muted-foreground"
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <span className={item.isComplete ? "text-muted-foreground" : "text-foreground font-medium"}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {completionPercentage < 90 && (
          <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Complete your profile to stand out</p>
                <p className="text-muted-foreground mt-1">
                  Profiles with 90%+ completion get <strong className="text-indigo-600">5× more offers</strong> and views from recruiters.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}