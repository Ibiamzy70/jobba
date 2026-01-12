import React from 'react';
import { CheckCircle2, Star, Sparkles } from 'lucide-react';

const ProfileMatch = () => {
  return (
    <div className="relative group overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-[2.5rem] border border-[#0077b5]/10 p-6 shadow-sm hover:shadow-xl transition-all duration-500">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
        <Sparkles className="h-12 w-12 text-[#0077b5]" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="h-14 w-14 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
            {/* Fixed: Proper closing */}
            <div className="w-full h-full bg-gradient-to-tr from-slate-400 to-slate-300 flex items-center justify-center text-white font-bold text-xl">
              JD
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 leading-tight">Elite Profile</h4>
          <p className="text-[10px] font-bold text-[#0077b5] uppercase tracking-wider">Ready for Hire</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Profile Strength</span>
          <span className="text-[#0077b5] font-bold">98%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="w-[98%] h-full bg-[#0077b5] rounded-full group-hover:bg-blue-400 transition-all duration-700" />
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] font-bold text-slate-700">Top 1% Talent</span>
        </div>
        <button className="text-[11px] font-black text-[#0077b5] hover:text-[#005a87] transition-colors">
          VIEW SCORE
        </button>
      </div>
    </div>
  );
};

export default ProfileMatch; 