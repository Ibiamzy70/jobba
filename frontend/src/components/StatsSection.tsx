// src/components/StatsSection.tsx (Production Ready — Horizontal Elite)
import { useEffect, useState, useRef } from "react";
import { Users, Briefcase, Building2, Globe } from "lucide-react";

// Smooth intersection-triggered counter hook
const useCounter = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          let start = 0;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [end, duration, hasStarted]);

  return { count, ref };
};

// Stat Card Component
const StatCard = ({
  icon,
  value,
  suffix = "",
  label,
}: {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
}) => {
  const { count, ref } = useCounter(value);

  return (
    <div
      ref={ref}
      className="group relative flex items-center gap-5 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500"
    >
      <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-500">
        {icon}
      </div>

      <div>
        <div className="text-3xl font-black text-white tracking-tight">
          {count.toLocaleString()}
          <span className="text-xl">{suffix}</span>
        </div>
        <div className="text-sm font-bold uppercase tracking-wider text-white/60 group-hover:text-white/80 transition-colors">
          {label}
        </div>
      </div>

      {/* Subtle pulse dot */}
      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-400 animate-pulse opacity-70" />
    </div>
  );
};

// Trusted By Logos (Horizontal Scroll Marquee)
const LogoCloud = () => {
  const logos = ["Google", "Meta", "Amazon", "Stripe", "Vercel", "Microsoft", "Netflix", "Spotify"];

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-white/40 mb-5">
        Trusted by leading companies worldwide
      </p>

      <div className="flex items-center justify-center gap-12 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="mx-8 text-lg font-bold text-white/30 hover:text-white/60 transition-colors duration-300"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="w-full bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 py-16 px-6">
      <div className="container mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Powering Careers at Scale
          </h2>
          <p className="mt-4 text-lg text-white/70 font-medium">
            Real-time insights from our global platform
          </p>
        </div>

        {/* Horizontal Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard
            icon={<Users className="h-8 w-8" />}
            value={5000}
            suffix="+"
            label="Active Job Seekers"
          />
          <StatCard
            icon={<Briefcase className="h-8 w-8" />}
            value={10000}
            suffix="+"
            label="Job Opportunities"
          />
          <StatCard
            icon={<Building2 className="h-8 w-8" />}
            value={5000}
            suffix="+"
            label="Hiring Organizations"
          />
          <StatCard
            icon={<Globe className="h-8 w-8" />}
            value={80}
            suffix="+"
            label="Countries Served"
          />
        </div>

        {/* Trusted By Marquee */}
        <LogoCloud />
      </div>
    </section>
  );
};

export default StatsSection;