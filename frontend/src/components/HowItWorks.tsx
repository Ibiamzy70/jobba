import { CheckCircle, Search, Upload, BriefcaseIcon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Create an Account",
      description: "Sign up for free and complete your profile with your skills.",
      accent: "from-blue-500 to-indigo-500",
      color: "text-blue-500"
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Search for Jobs",
      description: "Browse through thousands of matches for your preferences.",
      accent: "from-emerald-500 to-teal-500",
      color: "text-emerald-500"
    },
    {
      icon: <BriefcaseIcon className="h-6 w-6" />,
      title: "Apply with Ease",
      description: "Send applications with clicks and track your progress.",
      accent: "from-blue-600 to-emerald-600",
      color: "text-blue-600"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Land Your Dream Job",
      description: "Interview and receive offers for your perfect role.",
      accent: "from-emerald-600 to-teal-400",
      color: "text-teal-600"
    }
  ];

  return (
    // Removed external section padding/bg to inherit from Index.tsx sticky container
    <div className="relative w-full py-2">
      {/* Header: Left Aligned for Horizontal Flow */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
          <Sparkles className="h-3 w-3" />
          The Journey
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
          Your path to <span className="text-emerald-600 italic font-serif">excellence</span>
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
          A streamlined process designed to elevate your career to the next professional tier.
        </p>
      </div>

      {/* The Timeline Flow: Vertical stack for a horizontal layout column */}
      <div className="space-y-8 relative">
        {/* Connecting Line (Vertical) */}
        <div className="absolute left-[31px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-100 via-emerald-100 to-transparent" />

        {steps.map((step, index) => (
          <div key={index} className="group relative flex items-start gap-6">
            
            {/* Icon Node with Step Number */}
            <div className="relative z-10 shrink-0">
              <div className={`absolute inset-0 bg-gradient-to-br ${step.accent} blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full`} />
              
              <div className="relative flex items-center justify-center w-16 h-16 rounded-[22px] bg-white border border-slate-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-500">
                <div className="text-slate-400 group-hover:text-blue-600 transition-colors duration-500">
                  {step.icon}
                </div>
                {/* Minimal Step Number */}
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {index + 1}
                </span>
              </div>
            </div>

            {/* Content: Left Aligned */}
            <div className="pt-2">
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-xs">
                {step.description}
              </p>
              
              {/* Subtle Progress Indicator */}
              <div className="mt-3 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 group-hover:w-full transition-all duration-700 rounded-full opacity-40" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Call: Compact & Professional */}
      <div className="mt-12">
        <div className="inline-flex items-center gap-4 p-1.5 pr-5 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:bg-white transition-all">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10">
            <ArrowRight className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-600 tracking-tight">
            Ready? <Link to="/signup" className="text-blue-600 hover:underline ml-1">Get started now</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default HowItWorks;