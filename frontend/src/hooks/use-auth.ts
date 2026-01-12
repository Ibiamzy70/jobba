import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/auth";
import axios from "axios"; 
import { useAuthStore } from "../lib/auth";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";

// === Types ===
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  password2: string;
  role: "applicant" | "employer";
}

// === Base URL for clean requests ===
const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const useLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const res = await axios.post(`${API_BASE}/auth/login/`, { email, password });
      return res.data;
    },
    onSuccess: (data) => {
      login(data);
      toast({ title: "Welcome back!" });

      // ← FIXED: Role-based redirect
      const userRole = data.user?.role || data.role;
      if (userRole === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/profile");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Invalid credentials";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useRegister = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await axios.post(`${API_BASE}/accounts/register/`, data);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      toast({ title: "Account created!" });

      try {
        const res = await axios.post(`${API_BASE}/auth/login/`, {
          email: variables.email,
          password: variables.password,
        });
        login(res.data);

        // ← FIXED: Role-based redirect after auto-login
        const userRole = res.data.user?.role || res.data.role || variables.role;
        if (userRole === "employer") {
          navigate("/employer/dashboard");
        } else {
          navigate("/profile");
        }
      } catch (error: any) {
        toast({
          title: "Auto-login failed",
          description: error.response?.data?.detail || "Please log in manually.",
          variant: "destructive",
        });
        navigate("/login");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Please try again.";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    },
  });
};


export const useLogout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      
      try {
        await axiosInstance.post("/auth/logout/", {}, { withCredentials: true });
      } catch (err) {
        
        console.log("Logout endpoint failed (expected on expired token)");
      }
    },
    onSuccess: () => {
      logout(); 
      toast({ title: "Logged out successfully" });
      navigate("/login", { replace: true });
    },
    onError: () => {
      logout();
      toast({ title: "Logged out locally" });
      navigate("/login", { replace: true });
    },
  });
};