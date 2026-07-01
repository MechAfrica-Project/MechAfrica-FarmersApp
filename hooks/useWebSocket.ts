import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getAuthToken } from '@/lib/apiClient';
import { getApiUrlOrPlaceholder } from '@/lib/env';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: string;
  message_id?: string;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const baseUrl = getApiUrlOrPlaceholder();
      const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const url = `${wsUrl}/ws/connect?token=${token}`;

      console.log('[WebSocket] Connecting to', wsUrl);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (e) => {
        try {
          const msg: WebSocketMessage = JSON.parse(e.data);
          console.log('[WebSocket] Message received:', msg.type);
          
          // Handle specific events globally (e.g. refresh data, show toast, etc.)
          // In the future, we could trigger Zustand actions here.
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.current.onerror = (e) => {
        console.error('[WebSocket] Error:', e);
      };

      ws.current.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        ws.current = null;
        scheduleReconnect();
      };
    } catch (e) {
      console.error('[WebSocket] Setup error:', e);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      console.log(`[WebSocket] Reconnecting in ${delay}ms...`);
      reconnectTimeout.current = setTimeout(connect, delay);
    }
  }, [connect]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
          reconnectAttempts.current = 0;
          connect();
        }
      } else if (nextAppState === 'background') {
        disconnect();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [connect, disconnect]);

  return { isConnected, ws: ws.current };
}
