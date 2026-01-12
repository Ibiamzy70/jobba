import { BriefcaseIcon, Linkedin, Twitter, Github, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobbaLogoEmerald from "./icons/Jobba2"

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // Updated to match requested text
  const backgroundText = "JOBBA PRO";

  return (
    <footer className="relative bg-[#050505] pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* 1. ADVANCED BACKGROUND LAYER - 3D WALL EFFECT */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center">
        {/* Large Decorative Text - Designed to look like a 3D Wall */}
        <h2 
          className="absolute top-0 text-[18vw] font-black leading-none tracking-tighter transition-all duration-700 uppercase"
          style={{ 
            color: '#0a0a0a', // Deep solid color for the "wall" body
            // Multi-layered text shadow to create the 3D "Enviable" depth
            textShadow: `
              1px 1px 0px #1a1a1a,
              2px 2px 0px #151515,
              3px 3px 0px #111111,
              4px 4px 0px #0a0a0a,
              5px 5px 20px rgba(0,0,0,1), 
              0 0 80px rgba(16, 185, 129, 0.05)
            `,
            WebkitTextStroke: '1px rgba(255,255,255,0.03)', // Subtle rim lighting
          }}
        >
          {backgroundText}
        </h2>
        
        {/* Dynamic Glows / Lighting - The "Aura" */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* 2. GLASS CONTENT CARD */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3 group">
              <JobbaLogoEmerald />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-light">
              Connecting elite talent with world-class opportunities. 
              Our precision-matching engine redefines the modern job search experience.
            </p>
          </div>

          {/* Navigation Links - Kept consistent with original spacing */}
          <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">For Job Seekers</h3>
              <ul className="space-y-4">
                {['Browse Jobs', 'Create Profile', 'Job Alerts', 'Career Resources'].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-slate-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                      <span className="h-px w-0 bg-emerald-500 transition-all group-hover:w-3" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">For Employers</h3>
              <ul className="space-y-4">
                {['Post a Job', 'Pricing', 'Employer Resources'].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-slate-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                      <span className="h-px w-0 bg-emerald-500 transition-all group-hover:w-3" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">Company</h3>
              <ul className="space-y-4">
                {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-slate-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                      <span className="h-px w-0 bg-emerald-500 transition-all group-hover:w-3" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM UTILITY BAR - Original social placement kept */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              © {currentYear} JOBBA pro. A Premium Experience.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-5">
              <Twitter className="h-4 w-4 text-slate-500 hover:text-white cursor-pointer transition-all hover:-translate-y-1" />
              <Linkedin className="h-4 w-4 text-slate-500 hover:text-white cursor-pointer transition-all hover:-translate-y-1" />
              <Github className="h-4 w-4 text-slate-500 hover:text-white cursor-pointer transition-all hover:-translate-y-1" />
            </div>
            
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-white tracking-widest cursor-pointer hover:text-emerald-500 transition-colors">
              <Globe className="h-3.5 w-3.5" />
              EN-US
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;