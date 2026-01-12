import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    content: "JOBBA Pro helped me land my dream job as a senior developer within just two weeks. The platform's intuitive interface and job matching algorithms made my job search incredibly efficient.",
    author: "Sarah Jegga",
    position: "Frontend Developer at Kanbanmedia",
    image: "/images/wrk3.jfif"
  },
  {
    content: "As an employer, I've found exceptional talent through jobba. The quality of candidates and the platform's filtering tools saved our HR team countless hours in the hiring process.",
    author: "Michael Ademola",
    position: "HR Director at DataFlow Systems",
    image: "/images/wrk1.jfif"
  },
  {
    content: "After being laid off during the pandemic, I was worried about finding a new position. jobba not only helped me find a job, but one that paid better and offered more growth opportunities!",
    author: "allen Wilson Onyeama",
    position: "Electrical engineer at PowerSurge.inc",
    image: "/images/wrk.jfif"
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const previous = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-20 lg:py-24 bg-white relative overflow-hidden">
      {/* Refined, smaller ambient blur */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-64 h-64 bg-emerald-50/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Side: Scaled Down Visual */}
          <div className="relative w-full lg:w-2/5 flex justify-center lg:justify-end">
            {/* Softened Background No. Index */}
            <div className="absolute -top-10 -left-4 text-[120px] font-black text-slate-50/80 select-none tracking-tighter">
              0{currentIndex + 1}
            </div>
            
            <div className="relative w-64 h-80 lg:w-72 lg:h-96">
              {/* Thin, elegant staggered border */}
              <div className="absolute inset-0 border border-emerald-100/60 rounded-2xl translate-x-3 translate-y-3" />
              
              <div className="relative h-full w-full rounded-2xl overflow-hidden border-[8px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].author} 
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out hover:scale-110"
                />
              </div>
              
              {/* Minimal Floating Quote Box */}
              <div className="absolute -bottom-4 -right-4 bg-slate-900 p-4 rounded-xl shadow-lg">
                <Quote className="h-4 w-4 text-emerald-400 fill-current" />
              </div>
            </div>
          </div>

          {/* Right Side: Content (Compact Typography) */}
          <div className="w-full lg:w-3/5">
            <div className="max-w-md">
              <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-emerald-600 mb-5 block">
                Testimonial
              </span>
              
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-8">
                The impact of <span className="text-emerald-600 italic font-serif">precision.</span>
              </h2>

              <blockquote className="relative">
                <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-light italic mb-8">
                  "{testimonials[currentIndex].content}"
                </p>
                
                <footer className="not-italic">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] w-8 bg-emerald-500" />
                    <div>
                      <div className="text-base font-bold text-slate-900">{testimonials[currentIndex].author}</div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {testimonials[currentIndex].position}
                      </div>
                    </div>
                  </div>
                </footer>
              </blockquote>

              {/* Navigation: Compact Control Bar */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={previous}
                    className="rounded-full h-10 w-10 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all duration-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={next}
                    className="rounded-full h-10 w-10 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all duration-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Micro Progress Lines */}
                <div className="flex items-center gap-2">
                  {testimonials.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-0.5 transition-all duration-500 rounded-full ${
                        i === currentIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;