import React from 'react';
import { Clock, Zap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentJobs = () => {
  const recentJobs = [
    { id: 1, title: "Senior Product Designer", company: "Linear", time: "2m ago", salary: "$140k", location: "Remote" },
    { id: 2, title: "Frontend Engineer", company: "Vercel", time: "15m ago", salary: "$160k", location: "NY" },
    { id: 3, title: "Marketing Lead", company: "Stripe", time: "1h ago", salary: "$130k", location: "London" },
  ];

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-slate-900 font-black text-lg flex items-center gap-2">
            Live Feed <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Recently Posted</p>
        </div>
        <Link to="/jobs" className="text-[10px] font-bold text-[#0077b5] hover:underline">
          VIEW ALL
        </Link>
      </div>

      <div className="space-y-4">
        {recentJobs.map((job) => (
          <div key={job.id} className="group cursor-pointer p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-300">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0077b5] transition-colors truncate pr-2">
                {job.title}
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                {job.salary}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-bold">{job.company}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="h-3 w-3" /> {job.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-[#0077b5] transition-all transform active:scale-95 flex items-center justify-center gap-2 group">
         Job Alert <Zap className="h-3 w-3 fill-red-400 text-yellow-400  group-hover:animate-bounce" />
      </button>
    </div>
  );
};

export default RecentJobs;