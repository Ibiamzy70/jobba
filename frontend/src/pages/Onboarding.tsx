import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import PersonalInfoStep from '../components/onboarding/PersonalInfoStep';
import SkillsStep from '../components/onboarding/SkillsStep';
import ExperienceStep from '../components/onboarding/ExperienceStep';
import EducationStep from '../components/onboarding/EducationStep';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const handleComplete = () => {
    // Role-based redirect after completion
    if (user?.role === "job_seeker") {
      navigate('/jobs');
    } else if (user?.role === "employer") {
      navigate('/profile');
    } else {
      navigate('/profile');
    }
  };

  const handleSkip = () => {
    // Role-based redirect when skipping
    if (user?.role === "job_seeker") {
      navigate('/jobs');
    } else if (user?.role === "employer") {
      navigate('/profile');
    } else {
      navigate('/profile');
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', description: 'Basic information about you' },
    { number: 2, title: 'Skills', description: 'Your expertise and abilities' },
    { number: 3, title: 'Experience', description: 'Your work history' },
    { number: 4, title: 'Education', description: 'Your academic background' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.full_name}! 👋
          </h1>
          <p className="text-gray-600">Let's build your professional profile in just a few steps</p>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-[#0A66C2]">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
          
          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {steps.map((s) => (
              <div
                key={s.number}
                className={`flex flex-col items-center text-center p-3 rounded-lg transition-all ${
                  step === s.number
                    ? 'bg-[#0A66C2] text-white'
                    : completedSteps.includes(s.number)
                    ? 'bg-green-50 text-green-700'
                    : 'bg-white text-gray-400'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full mb-2 font-semibold">
                  {completedSteps.includes(s.number) ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    s.number
                  )}
                </div>
                <div className="text-xs font-semibold">{s.title}</div>
                <div className="text-xs mt-1 opacity-75 hidden sm:block">{s.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <Card className="shadow-lg border-0">
          {step === 1 && (
            <PersonalInfoStep
              onNext={() => {
                handleStepComplete(1);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <SkillsStep
              onNext={() => {
                handleStepComplete(2);
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <ExperienceStep
              onNext={() => {
                handleStepComplete(3);
                setStep(4);
              }}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <EducationStep
              onNext={() => {
                handleStepComplete(4);
                handleComplete();
              }}
              onBack={() => setStep(3)}
            />
          )}
        </Card>

        {/* Skip Button */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900"
          >
            I'll complete this later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;