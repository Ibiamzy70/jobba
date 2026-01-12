import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Search, Briefcase, ChevronRight, Star } from "lucide-react";
import { Input } from "./ui/input";
import { 
  HealthAndSafetyIcon, 
  MarketingIcon, 
  TechnologyIcon, 
  BookIcon, 
  FinanceIcon, 
  DesignIcon 
} from "./icons/iconhub";
import ProfileMatch from "./ProfileMatch";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white py-16 md:py-24">
      {/* Subtle background depth */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-25" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-300 rounded-full blur-3xl opacity-15" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* 3-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-32">
          {/* Left: Hero Content */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-8 order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 shadow-sm">
              <Star className="h-4 w-4 fill-current" />
              Over 10,000+ active job listings
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold leading-tight text-gray-900">
              Find Your Dream <br />
              <span className="text-blue-600">Job</span> Today
            </h1>

            <p className="text-xl text-gray-600">
              Connect with top employers and discover opportunities that match your skills and career goals. Your next career move is just a click away.
            </p>

            {/* Search Bar */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500"
                  />
                </div>
                <Link to="/jobs">
                  <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Search Jobs
                  </Button>
                </Link>
              </div>

              <div className="mt-4 text-sm text-gray-600 flex flex-wrap gap-4 justify-center lg:justify-start">
                <span>Popular:</span>
                <Link to="/jobs?q=developer" className="text-blue-600 hover:underline font-medium">Developer</Link>
                <Link to="/jobs?q=designer" className="text-blue-600 hover:underline font-medium">Designer</Link>
                <Link to="/jobs?q=marketing" className="text-blue-600 hover:underline font-medium">Marketing</Link>
                <Link to="/jobs?q=data" className="text-blue-600 hover:underline font-medium">Data & Analytics</Link>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
              <Link to="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Create Free Account
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/post-job">
                <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>

          {/* Middle: Featured Categories (Your Custom Icons) */}
          <div className="lg:col-span-4 order-3 lg:order-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">Featured Categories</h3>
              
              <div className="grid grid-cols-2 gap-5">
                {[
                  { name: "Technology", count: 1200, icon: TechnologyIcon },
                  { name: "Marketing", count: 800, icon: MarketingIcon },
                  { name: "Design", count: 650, icon: DesignIcon },
                  { name: "Finance", count: 950, icon: FinanceIcon },
                  { name: "Healthcare", count: 700, icon: HealthAndSafetyIcon },
                  { name: "Education", count: 550, icon: BookIcon },
                ].map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <Link
                      key={cat.name}
                      to={`/jobs?category=${cat.name.toLowerCase()}`}
                      className="group block p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 mb-4 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <IconComponent className="h-6 w-6 text-blue-600 group-hover:text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600">{cat.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{cat.count}+ openings</p>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Link to="/jobs">
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 font-medium">
                    Explore all categories <ChevronRight className="inline h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: ProfileMatch */}
          <div className="lg:col-span-3 order-2 lg:order-3 flex items-start justify-center">
            <div className="w-full">
              <ProfileMatch />
            </div>
          </div>
        </div>

        {/* Work That Inspires Gallery */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Work That Inspires
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src={`/images/sv${i}.png`}
                    alt={`Inspiring workplace ${i}`}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <p className="text-white font-medium text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      Modern collaborative environment
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;