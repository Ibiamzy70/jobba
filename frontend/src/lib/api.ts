import { useAuthStore } from "./auth";

export const API_BASE =
  (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000/api").replace(/\/+$/, "");

export interface ApiError extends Error {
  status?: number;
  body?: any;
  response?: Response;
  isTimeout?: boolean;
  isNetworkError?: boolean;
  isAbort?: boolean;
}

// ===================================================================
// Types
// ===================================================================
export type RequestInterceptor = (
  url: string,
  options: RequestInit
) => [string, RequestInit] | Promise<[string, RequestInit]>;

export type ResponseInterceptor = <T>(response: Response, data: T) => T | Promise<T>;
export type ErrorInterceptor = (error: ApiError) => void | Promise<void>;
export type RetryInterceptor = (
  error: ApiError,
  attempt: number,
  maxRetries: number
) => boolean | Promise<boolean>;

export interface ApiFetchOptions extends RequestInit {
  retry?: number;
  timeoutMs?: number;
  credentialsMode?: RequestCredentials;
  retryDelayMs?: number;
  skipCsrf?: boolean;
  skipAuth?: boolean;
}

// ===================================================================
// Global Interceptors
// ===================================================================
const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];
const retryInterceptors: RetryInterceptor[] = [];

export const apiInterceptors = {
  request: { use: (fn: RequestInterceptor) => requestInterceptors.push(fn) },
  response: { use: (fn: ResponseInterceptor) => responseInterceptors.push(fn) },
  error: { use: (fn: ErrorInterceptor) => errorInterceptors.push(fn) },
  retry: { use: (fn: RetryInterceptor) => retryInterceptors.push(fn) },
} as const;

// ===================================================================
// Token Refresh (Enterprise-grade, no race conditions)
// ===================================================================
type RefreshTokenFn = () => Promise<string | null | undefined>;

let refreshTokenFn: RefreshTokenFn | null = null;
let isRefreshing = false;
let refreshQueue: ((token: string | null) => void)[] = [];

export const configureAuthRefresh = (fn: RefreshTokenFn) => {
  refreshTokenFn = fn;
};

const subscribeTokenRefresh = (cb: (token: string | null) => void) => refreshQueue.push(cb);
const resolveRefreshQueue = (token: string | null) => {
  refreshQueue.forEach(cb => cb(token));
  refreshQueue = [];
};

async function refreshAndRetry<T>(originalRequest: () => Promise<T>): Promise<T> {
  if (!refreshTokenFn) {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Refresh failed");

      const data = await response.json();
      const newToken = data.access_token;
      
      useAuthStore.getState().setToken(newToken);
      return originalRequest();
    } catch (err) {
      useAuthStore.getState().logout();
      throw new Error("Session expired");
    }
  }

  if (isRefreshing) {
    return new Promise<T>((resolve, reject) => {
      subscribeTokenRefresh(token => {
        if (!token) reject(new Error("Session expired"));
        else resolve(originalRequest());
      });
    });
  }

  isRefreshing = true;
  try {
    const newToken = await refreshTokenFn();
    resolveRefreshQueue(newToken);
    if (!newToken) throw new Error("Refresh token failed");
    return originalRequest();
  } catch (err) {
    resolveRefreshQueue(null);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

// ===================================================================
// CSRF Token (Django/FastAPI compatible)
// ===================================================================
const getCsrfToken = (): string | null => {
  const cookie = document.cookie
    .split("; ")
    .find(row => row.startsWith("csrftoken="))
    ?.split("=")[1];

  if (cookie) return cookie;

  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute("content") ?? null;
};

// ===================================================================
// Auto-inject Auth Token from Store
// ===================================================================
const getAuthToken = (): string | null => {
  return useAuthStore.getState().token;
};

// ===================================================================
// Final Production apiFetch
// ===================================================================
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRY_DELAY_MS = 300;

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {},
  authToken?: string | null
): Promise<T> {
  const {
    retry = 0,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    credentialsMode = "include",
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    skipCsrf = false,
    skipAuth = false,
    ...fetchOptions
  } = options;

  const fullUrl = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(fetchOptions.headers || {});

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!(fetchOptions.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (
    !skipCsrf &&
    credentialsMode === "include" &&
    ["POST", "PUT", "PATCH", "DELETE"].includes((fetchOptions.method ?? "GET").toUpperCase())
  ) {
    const token = getCsrfToken();
    if (token) {
      headers.set("X-CSRFToken", token);
      headers.set("X-XSRF-TOKEN", token);
    }
  }

  if (!skipAuth) {
    const token = authToken ?? getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let currentUrl = fullUrl;
  let currentOptions: RequestInit = { ...fetchOptions, headers, credentials: credentialsMode };

  for (const interceptor of requestInterceptors) {
    const result = await interceptor(currentUrl, currentOptions);
    [currentUrl, currentOptions] = Array.isArray(result) ? result : [currentUrl, currentOptions];
  }

  const attempt = async (attemptNum: number, delayMs: number): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(currentUrl, {
        ...currentOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse body ONCE - don't clone
      const contentType = response.headers.get("content-type") ?? "";
      let data: any;
      
      if (contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } else if (response.ok) {
        data = await response.blob();
      } else {
        const text = await response.text();
        data = text;
        try {
          if (text) data = JSON.parse(text);
        } catch {
          // Keep as text
        }
      }

      // Run response interceptors
      for (const interceptor of responseInterceptors) {
        data = await interceptor(response, data);
      }

      if (!response.ok) {
        const error: ApiError = new Error(
          (data as any)?.detail ?? (data as any)?.message ?? response.statusText ?? "Request failed"
        );
        error.status = response.status;
        error.body = data;
        error.response = response;
        error.isTimeout = false;
        error.isNetworkError = false;

        if (
          response.status === 401 &&
          !skipAuth &&
          attemptNum === 0
        ) {
          const currentToken = authToken ?? getAuthToken();
          if (currentToken) {
            return refreshAndRetry(() => apiFetch<T>(path, options, null));
          }
        }

        for (const interceptor of errorInterceptors) {
          await interceptor(error);
        }

        throw error;
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isTimeout = err.name === "AbortError";
      const isNetwork = err.name === "TypeError" || err.message === "Failed to fetch";

      const error: ApiError = Object.assign(err, {
        isTimeout,
        isNetworkError: isNetwork,
        isAbort: isTimeout,
      });

      let shouldRetry = true;
      for (const interceptor of retryInterceptors) {
        if ((await interceptor(error, attemptNum, retry)) === false) {
          shouldRetry = false;
        }
      }

      const retriable = isNetwork || isTimeout || [502, 503, 504].includes(error.status ?? 0);
      const canRetry = attemptNum < retry && shouldRetry && retriable;

      if (canRetry) {
        const nextDelay = delayMs * 2 + Math.random() * 100;
        await new Promise(r => setTimeout(r, nextDelay));
        return attempt(attemptNum + 1, nextDelay);
      }

      for (const interceptor of errorInterceptors) {
        await interceptor(error);
      }

      throw error;
    }
  };

  return attempt(0, retryDelayMs);
}

// ===================================================================
// Configure Auth Refresh on App Init
// ===================================================================
if (typeof window !== "undefined") {
  configureAuthRefresh(async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        useAuthStore.getState().logout();
        return null;
      }

      const data = await response.json();
      const newToken = data.access_token;
      
      useAuthStore.getState().setToken(newToken);
      return newToken;
    } catch (err) {
      useAuthStore.getState().logout();
      return null;
    }
  });
}