import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { apiFetch, configureAuthRefresh } from "../lib/api";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (token: string, refreshToken?: string, user?: AuthState["user"]) => void;
  logout: () => void;
  setTokens: (token: string | null, refreshToken?: string | null) => void;
  setUser: (user: AuthState["user"]) => void;
  init: () => Promise<void>;
}

// ===================================================================
// Refresh token endpoint (adjust if yours is different)
// ===================================================================
const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const data = await apiFetch<{
      access: string;
      refresh?: string;
    }>("/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });

    return data.access;
  } catch (err) {
    console.warn("Token refresh failed → logging out");
    useAuthStore.getState().logout();
    return null;
  }
};

// Configure global auto-refresh in apiFetch
configureAuthRefresh(refreshAccessToken);

// ===================================================================
// Zustand Store — Production Grade
// ===================================================================
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: true,

        login: (token, refreshToken, user) => {
          set({
            token,
            refreshToken: refreshToken ?? get().refreshToken,
            user: user ?? get().user,
            isAuthenticated: true,
            isLoading: false,
          });
        },

        logout: () => {
          set({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          localStorage.removeItem("auth-storage");
        },

        setTokens: (token, refreshToken) => {
          set({
            token,
            refreshToken: refreshToken ?? get().refreshToken,
          });
        },

        setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

        init: async () => {
          const { token } = get();
          if (!token) {
            set({ isLoading: false });
            return;
          }

          try {
            const user = await apiFetch<any>("/auth/me/", { skipAuth: false });
            set({ user, isAuthenticated: true, isLoading: false });
          } catch (err) {
            console.warn("Invalid session → logging out");
            get().logout();
          }
        },
      }),
      {
        name: "auth-storage",
        version: 5,
        partialize: (state) => ({
          user: state.user, 
        }),
        migrate: (persistedState: any, version) => {
          
          if (version < 5 || !persistedState || typeof persistedState !== "object") {
            console.log("Clearing invalid auth storage (v" + version + ")");
            return {
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            };
          }
          return persistedState as AuthState;
        },
      }
    ),
    { name: "AuthStore" }
  )
);