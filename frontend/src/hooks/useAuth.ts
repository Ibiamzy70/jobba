import { useAuthStore } from "@/stores/auth";
import { useEffect } from "react";

/**
 * 
 * Thin wrapper over Zustand store 
 */
export const useAuth = () => {
  const {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    init,
  } = useAuthStore();

  
  useEffect(() => {
    init();
  }, [init]);

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    
    // setToken: useAuthStore.getState().setTokens,
    // setUser: useAuthStore.getState().setUser,
  };
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: "APPLICANT" | "EMPLOYER" | "ADMIN";
  
};