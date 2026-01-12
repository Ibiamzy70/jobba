import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// === Auth Response Types ===
interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

interface RefreshResponse {
  access_token: string;
}

// === User Type ===
interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: "applicant" | "employer" | "admin";
  created_at?: string;
  applicant_profile?: {
    id: number;
    cv?: string | null;
    avatar?: string | null;
    first_name?: string;
    last_name?: string;
    phone?: string;
    location?: string;
    bio?: string;
    onboarding_completed?: boolean;
    [key: string]: any;
  };
  employer_profile?: {
    id: number;
    company_name?: string;
    company_logo?: string | null;
    [key: string]: any;
  };

}

// === Axios instance with interceptors ===
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

// Request: attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 401 → refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<RefreshResponse>(
          `${import.meta.env.VITE_API_URL || "/api"}/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        const newToken = data.access_token;
        useAuthStore.getState().setToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// === Auth Store ===
interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: AuthResponse) => void;
  logout: () => void;
  setToken: (token: string) => void;
  updateUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (data: AuthResponse) => {
        set({
          token: data.access_token,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        localStorage.removeItem("auth-storage");
        
      },

      setToken: (token: string) => {
        set({ token });
      },

      updateUser: (user: AuthUser) => {
        set({ user, isAuthenticated: true });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      version: 3, // ← Bumped version
      partialize: (state) => ({
        user: state.user,
        // DO NOT persist token — security best practice
      }),
      migrate: (persistedState: any, version) => {
        // Handle old versions gracefully
        if (version < 3) {
          return {
            user: persistedState?.user || null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          };
        }
        return persistedState as AuthState;
      },
      // Optional: onRehydrateStorage for debugging
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Auth store rehydrated", state);
        }
      },
    }
  )
);

export { api as axiosInstance };