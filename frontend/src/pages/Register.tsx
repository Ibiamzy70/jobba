import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { BriefcaseIcon, Loader2, ChevronRight } from "lucide-react";
import { useRegister } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import AppRegistrationIcon from "../components/icons/AppRegistrationIcon";


export default function Register() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState<"applicant" | "employer">("applicant");

  const registerMutation = useRegister();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-redirect on success based on role
  useEffect(() => {
    if (registerMutation.isSuccess) {
      toast({
        title: "Account created!",
        description: "Welcome to JOBBA Pro. Your account has been created successfully.",
      });
      
      // Role-based redirect
      if (role === "applicant") navigate("/jobs");
      if (role === "employer") navigate("/profile");
    }
  }, [registerMutation.isSuccess, role, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== password2) {
      registerMutation.reset();
      return toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
    }

    if (password.length < 8) {
      return toast({
        title: "Password too weak",
        description: "Must be at least 8 characters long with numbers and symbols",
        variant: "destructive",
      });
    }

    registerMutation.mutate({
      email: email.toLowerCase().trim(),
      full_name: fullName.trim(),
      password,
      password2,
      role,
    });
  };

  const isPending = registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white mb-4">
              <AppRegistrationIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-600 mt-2">Start your journey with JOBBA Pro</p>
          </div>

          {/* Account Type Selector */}
          <div className="flex rounded-md mb-6 bg-gray-50 p-1">
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                role === "applicant"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setRole("applicant")}
              disabled={isPending}
            >
              Job Seeker
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                role === "employer"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setRole("employer")}
              disabled={isPending}
            >
              Employer
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                disabled={isPending}
                className="w-full"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                autoComplete="email"
                disabled={isPending}
                className="w-full"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isPending}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters long with numbers and symbols
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                id="password2"
                type="password"
                placeholder="Confirm your password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isPending}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <Button
  type="submit"
  disabled={isPending}
  className="
    group relative overflow-hidden w-full h-12 text-md font-semibold tracking-tight
    transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
    bg-blue-600 text-white
    rounded-lg border border-blue-500/30
    
    /* Premium Depth Effects */
    shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_8px_20px_-6px_rgba(37,99,235,0.5)]
    hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_12px_25px_-5px_rgba(37,99,235,0.6)]
    hover:bg-blue-500 hover:-translate-y-0.5 active:scale-[0.99]
    
    /* Interactive Layer */
    before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500
    before:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0%,_transparent_70%)]
    hover:before:opacity-100
  "
>
  <span className="relative z-10 flex items-center justify-center gap-2">
    {isPending ? (
      <>
        <Loader2 className="h-5 w-5 animate-spin text-blue-100" />
        <span className="tracking-wide">Building your profile...</span>
      </>
    ) : (
      <>
        <span className="relative">
          Create account
          <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-white/40 transition-all duration-300 group-hover:w-full" />
        </span>
        <ChevronRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1.5 group-hover:scale-110" />
      </>
    )}
  </span>

  {/* Background Glass Flare */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700
    bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)]
    bg-[length:250%_250%] animate-[shimmer_3s_infinite_linear]" 
  />
</Button>

            {/* Terms & Privacy */}
            <p className="text-xs text-center text-gray-500">
              By clicking "Create account", you agree to our{" "}
              <Link
                to="/terms"
                className="text-blue-600 hover:underline"
                onClick={(e) => isPending && e.preventDefault()}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-blue-600 hover:underline"
                onClick={(e) => isPending && e.preventDefault()}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => isPending && e.preventDefault()}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}