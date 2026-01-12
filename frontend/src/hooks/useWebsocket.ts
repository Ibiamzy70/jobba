// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from "react";

export function useWebSocket<T = any>(
  url: string | null | undefined,
  options: {
    token?: string | null;
    onMessage?: (data: T) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    reconnectAttempts?: number;     
    reconnectDelayMs?: number;      
    heartbeatIntervalMs?: number;   
    heartbeatMessage?: string;      
  } = {}
) {
  const {
    token,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts = Infinity,
    reconnectDelayMs = 1000,
    heartbeatIntervalMs = 30_000,
    heartbeatMessage = "ping",
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);

  const cleanup = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!url) return;

    cleanup();

    const finalUrl = token
      ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
      : url;

    const ws = new WebSocket(finalUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptRef.current = 0;
      onOpen?.();

      // Start heartbeat
      if (heartbeatIntervalMs > 0) {
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(heartbeatMessage);
          }
        }, heartbeatIntervalMs);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch {
        onMessage?.(event.data as any);
      }
    };

    ws.onerror = (error) => {
      onError?.(error);
    };

    ws.onclose = () => {
      cleanup();
      onClose?.();

      if (attemptRef.current < reconnectAttempts) {
        const delay = reconnectDelayMs * Math.pow(2, attemptRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          attemptRef.current++;
          connect();
        }, delay);
      }
    };
  }, [
    url,
    token,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts,
    reconnectDelayMs,
    heartbeatIntervalMs,
    heartbeatMessage,
    cleanup,
  ]);

  useEffect(() => {
    if (url) {
      connect();
    } else {
      cleanup();
    }

    return cleanup;
  }, [url, connect, cleanup]);

  // Manual control (optional)
  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }, []);

  const reconnect = useCallback(() => {
    cleanup();
    attemptRef.current = 0;
    connect();
  }, [cleanup, connect]);

  return {
    send,
    reconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    isConnecting: wsRef.current?.readyState === WebSocket.CONNECTING,
  };
}