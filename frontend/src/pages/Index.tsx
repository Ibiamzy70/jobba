import React from 'react';
import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import FeaturedJobs from '../components/FeaturedJobs';
import HowItWorks from '../components/HowItWorks';
import StatsSection from '../components/StatsSection';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import RecentJobs from '../components/RecentJobs';

const Index = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#fcfcfd] overflow-x-hidden selection:bg-blue-100">
      {/* 1. Innovative Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-50/40 blur-[100px]" />
      </div>

      <NavBar />

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Hero Section */}
        <Hero />

        {/* 2. Modernized StatsSection — Now with 3D Float & Extra Curves */}
        <div className="my-32 relative group">
          {/* Subtle Glow Behind Stats */}
          <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-[60px] transform group-hover:scale-105 transition-transform duration-700" />
          <div className="relative z-10">
            <StatsSection />
          </div>
        </div>

        {/* 3. RecentJobs — High-Density Glass Card */}
        <div className="mb-32">
          <div className="rounded-[40px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_32px_64px_rgba(0,119,181,0.08)] overflow-hidden transition-all duration-500">
            <RecentJobs />
          </div>
        </div>

        {/* 4. Featured Jobs — Horizontal Feature Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-12">
            <div className="relative p-1">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl" />
              <FeaturedJobs />
            </div>
          </div>
        </div>

        {/* 5. Asymmetric Grid: HowItWorks & Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start mb-24">
          <div className="lg:col-span-6 lg:sticky lg:top-28 transition-all duration-700">
            <div className="rounded-[48px] bg-white p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500">
              <HowItWorks />
            </div>
          </div>
          
          <div className="lg:col-span-4 lg:mt-32">
            <div className="transform hover:translate-y-[-8px] transition-transform duration-500">
              <Testimonials />
            </div>
          </div>
        </div>

        {/* 6. High-Impact Closing Section */}
        <div className="relative w-full max-w-6xl mx-auto mb-20 px-2">
          <div className="overflow-hidden rounded-[56px] shadow-[0_48px_80px_-16px_rgba(0,119,181,0.15)] bg-white">
            <CTA />
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Grain Overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default Index;