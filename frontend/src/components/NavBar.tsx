import { useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Briefcase, Search, User, LogOut, ChevronDown, Building2, Users, BookOpen, HelpCircle, TrendingUp, UserCheck  } from "lucide-react";
import { useAuthStore } from "../lib/auth";
import { useLogout } from "../hooks/use-auth";
import JobbaLogo from "./icons/Jobba";

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <JobbaLogo />
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-muted"
          >
            Home
          </Link>

          {/* Mega Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-muted">
              Solutions
              <ChevronDown className={`h-4 w-4 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega Menu */}
            {megaMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-screen max-w-5xl bg-white border rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-8 p-10">
                  {/* Left: Main Columns */}
                  <div className="col-span-8 grid grid-cols-3 gap-8">
                    {/* Job Seekers */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-5 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        For Job Seekers
                      </h3>
                      <ul className="space-y-4">
                        <li className="group cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Search className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-blue-600">Browse Jobs</p>
                              <p className="text-sm text-muted-foreground">Discover opportunities that match your skills</p>
                            </div>
                          </div>
                        </li>
                        <li className="group cursor-pointer">
                          <div className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-blue-600">AI Match Insights</p>
                              <p className="text-sm text-muted-foreground">See how well you fit each role</p>
                            </div>
                          </div>
                        </li>
                        <li className="group cursor-pointer">
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-blue-600">Career Resources</p>
                              <p className="text-sm text-muted-foreground">Resume tips, interview prep, and more</p>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>

                    {/* Employers */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-5 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        For Employers
                      </h3>
                      <ul className="space-y-4">
                        <li className="group cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-blue-600">Post Jobs</p>
                              <p className="text-sm text-muted-foreground">Reach qualified candidates fast</p>
                            </div>
                          </div>
                        </li>
                        <li className="group cursor-pointer">
                          <div className="flex items-start gap-3">
                            <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-blue-600">AI Screening</p>
                              <p className="text-sm text-muted-foreground">Find best-fit applicants automatically</p>
                            </div>
                          </div>
                        </li>
                        <li className="group cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-blue-600">Talent Dashboard</p>
                              <p className="text-sm text-muted-foreground">Manage applications in one place</p>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>

                    {/* Resources */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-5 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Resources
                      </h3>
                      <ul className="space-y-4">
                        <li className="group cursor-pointer">
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-blue-600">Blog</p>
                              <p className="text-sm text-muted-foreground">Career advice and industry trends</p>
                            </div>
                          </div>
                        </li>
                        <li className="group cursor-pointer">
                          <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-blue-600">Help Center</p>
                              <p className="text-sm text-muted-foreground">Get answers to common questions</p>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Right: Highlight Card */}
                  <div className="col-span-4 bg-blue-600 rounded-2xl p-8 text-white flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-3">Your Career, Accelerated</h3>
                      <p className="text-blue-100 mb-6">
                        AI-powered matching, modern tools, and real opportunities — all in one place.
                      </p>
                    </div>
                    <Button size="lg" variant="secondary" className="w-full bg-white text-blue-600 hover:bg-gray-100">
                      Get Started Free →
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/jobs" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-muted">
            Find Jobs
          </Link>
          <Link to="/post-job" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-muted">
            Post Job
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user?.full_name || "My Profile"}
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="container py-4 space-y-3">
            <Link to="/" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/jobs" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Find Jobs</Link>
            <Link to="/post-job" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Post Job</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                  <User className="inline h-4 w-4 mr-2" />
                  {user?.full_name || "Profile"}
                </Link>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link to="/register">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setMobileMenuOpen(false)}>
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;