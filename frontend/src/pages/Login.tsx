import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useLogin } from "../hooks/use-auth";
import LockIcon from "../components/icons/LockIcon";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white mb-6">
              <LockIcon  className="h-9 w-9" />
            </div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-gray-600 mt-2">Log in to your JOBBA account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
  type="submit"
  disabled={loginMutation.isPending}
  className="
    relative overflow-hidden w-full h-12 text-lg font-bold tracking-wide
    transition-all duration-300 ease-out
    bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700
    text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)]
    hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)]
    hover:-translate-y-0.5 active:scale-[0.98]
    before:absolute before:inset-0
    before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
    before:translate-x-[-200%] hover:before:animate-[shimmer_1.5s_infinite]
    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
    rounded-xl border border-blue-400/20
  "
>
  <span className="relative z-10 flex items-center justify-center gap-2">
    {loginMutation.isPending ? (
      <>
        <Loader2 className="h-5 w-5 animate-spin stroke-[3px]" />
        <span className="animate-pulse">Authenticating...</span>
      </>
    ) : (
      <>
        Sign in
        <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
      </>
    )}
  </span>
</Button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline ml-1">
              Sign up free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}