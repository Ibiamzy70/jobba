import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, Plus, ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto relative group">
          
          {/* THE AURORA: Abstract glow behind the pod */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-blue-500/20 rounded-[4rem] blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />

          {/* THE POD: Compact, Advanced Glass Surface */}
          <div className="relative bg-slate-900 rounded-[3rem] p-10 md:p-14 overflow-hidden border border-slate-800 shadow-2xl">
            
            {/* Background Tech-Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              
              {/* Left: Focused Typography */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">
                    Job Availability: Available
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.1]">
                  Scale your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                    professional reach.
                  </span>
                </h2>
              </div>

              {/* Right: Interactive Button Cluster */}
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {/* Primary Action */}
                <Link to="/register">
                  <button className="group/btn relative w-full md:w-56 h-14 bg-white rounded-2xl font-bold text-[11px] uppercase tracking-widest text-slate-900 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-blue-50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                </Link>

                {/* Secondary Action: Minimalist Link */}
                <Link to="/post-job" className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors py-2">
                  <Plus className="h-3 w-3 text-emerald-500" />
                  Employer? Post a role
                </Link>
              </div>

            </div>

            {/* Decorative "Corner Status" - Very modern SaaS style */}
            <div className="absolute top-0 right-0 p-8 hidden lg:block">
              <div className="flex items-center gap-4 rotate-90 origin-right translate-y-8">
                 <div className="h-px w-12 bg-slate-800" />
                 <span className="text-[8px] font-bold text-slate-600 tracking-[0.5em] uppercase whitespace-nowrap">
                   JOBBA Protocol v.25
                 </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;