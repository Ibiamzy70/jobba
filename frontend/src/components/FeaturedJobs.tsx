import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import JobCard from './JobCard'; 
import { featuredJobs } from '@/data/jobs';
import { ArrowRight, Plus } from 'lucide-react';

const FeaturedJobs = () => {
  const [displayCount, setDisplayCount] = useState(6);
  
  const showMoreJobs = () => {
    setDisplayCount(prev => Math.min(prev + 3, featuredJobs.length));
  };

  return (
    <section className="py-20 lg:py-28 bg-[#FCFCFD] relative overflow-hidden">
      {/* Soft Artistic Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-emerald-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30rem] h-[30rem] bg-blue-100/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header: Compact & Minimalist */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-slate-100 pb-10">
          <div className="max-w-md">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600 mb-3 block">
              Selection 2025
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
              Elite <span className="font-light italic text-slate-500">Opportunities</span>
            </h2>
          </div>
          
          <Link to="/jobs" className="mt-6 md:mt-0 group">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
              View Directory 
              <div className="w-8 h-px bg-slate-200 group-hover:w-12 group-hover:bg-slate-900 transition-all duration-500" />
            </div>
          </Link>
        </div>
        
        {/* The Staggered Grid: Smaller footprint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {featuredJobs.slice(0, displayCount).map((job, index) => (
            <div 
              key={job.id} 
              className={`group relative transition-all duration-1000 ease-in-out
                ${index % 3 === 1 ? 'lg:translate-y-8' : ''}
                ${index % 3 === 2 ? 'lg:translate-y-16' : ''}
              `}
            >
              {/* Elegant Index */}
              <div className="flex items-center gap-2 mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-medium font-mono text-slate-400 italic">No.</span>
                <span className="text-sm font-semibold text-slate-900">0{index + 1}</span>
              </div>

              {/* Luxury Compact Card */}
              <div className="relative bg-white border border-slate-100 rounded-xl p-1.5 transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] group-hover:border-emerald-100/50">
                <div className="bg-[#FAFAFB] group-hover:bg-white rounded-[calc(0.75rem-2px)] p-5 transition-colors">
                  {/* We assume JobCard is now strictly content, no padding */}
                  <JobCard job={job} />
                  
                  <div className="mt-5 pt-4 border-t border-slate-100/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                      {job.location || 'Remote'}
                    </span>
                    <button className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 group/btn">
                      Apply <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Luxury Load More: Minimalist Path */}
        {displayCount < featuredJobs.length && (
          <div className="mt-32 flex flex-col items-center">
            <button 
              onClick={showMoreJobs}
              className="group flex flex-col items-center gap-3 transition-all active:scale-95"
            >
              <div className="relative h-12 w-[1px] bg-slate-200 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-emerald-500 -translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              </div>
              <div className="flex items-center gap-2">
                 <Plus className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 group-hover:text-slate-900 transition-colors">
                    Expand Archive
                 </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedJobs;