import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getAuthToken } from '@/lib/api';
import { getApiUrlOrPlaceholder } from '@/lib/env';
import { toastInfo, toastSuccess } from '@/lib/toast';
import { useRequestsStore } from '@/stores/requestsStore';
import { useNotificationStore } from '@/stores/notificationStore';

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
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connectRef = useRef<() => Promise<void>>(async () => {});

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      console.log(`[WebSocket] Reconnecting in ${delay}ms...`);
      reconnectTimeout.current = setTimeout(() => connectRef.current?.(), delay);
    }
  }, []);

  const connect = useCallback(async () => {
    // Prevent multiple concurrent connection attempts
    if (ws.current) return;
    // Set a flag to prevent race conditions during the async getAuthToken
    ws.current = 'connecting' as any;

    try {
      const token = await getAuthToken();
      if (!token) {
        ws.current = null;
        return;
      }

      const baseUrl = getApiUrlOrPlaceholder();
      const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const url = `${wsUrl}/ws/connect?token=${token}`;

      console.log('[WebSocket] Connecting to', wsUrl);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Subscribe to channels to receive notifications
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'subscribe',
            payload: { channels: ['notifications', 'system_alert'] }
          }));
        }

        // Send a ping every 30 seconds to keep the connection alive (Railway proxy timeout is 55s)
        if (pingInterval.current) clearInterval(pingInterval.current);
        pingInterval.current = setInterval(() => {
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.current.onmessage = (e) => {
        try {
          const msg: WebSocketMessage = JSON.parse(e.data);
          console.log('[WebSocket] Message received:', msg.type);
          
          // Handle specific events globally
          if (msg.type === 'work_started') {
            const providerName = msg.payload?.provider_name || 'Your provider';
            toastInfo('Service In Progress', `${providerName} has started working on your request.`);
            useRequestsStore.getState().fetchRequests?.();
          } else if (msg.type === 'service_request_update') {
            toastInfo('Request Update', `Your service request was updated.`);
            useRequestsStore.getState().fetchRequests?.();
          } else if (msg.type === 'request_accepted') {
            toastSuccess('Request Accepted!', `A provider has accepted your request.`);
            useRequestsStore.getState().fetchRequests?.();
          } else if (msg.type === 'request_declined') {
            toastInfo('Request Declined', `A provider declined your request.`);
            useRequestsStore.getState().fetchRequests?.();
          } else if (msg.type === 'work_completed') {
            toastSuccess('Work Completed!', `Your service request has been marked as completed.`);
            useRequestsStore.getState().fetchRequests?.();
          } else if (msg.type === 'request_cancelled') {
            toastInfo('Request Cancelled', `Your service request has been cancelled.`);
            useRequestsStore.getState().fetchRequests?.();
          }

          // Trigger a silent refresh for notifications if it's a known event
          if (['work_started', 'service_request_update', 'request_accepted', 'request_declined', 'work_completed', 'request_cancelled'].includes(msg.type)) {
            useNotificationStore.getState().fetchNotifications?.(true);
          }
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
        if (pingInterval.current) {
          clearInterval(pingInterval.current);
          pingInterval.current = null;
        }
        scheduleReconnect();
      };
    } catch (e) {
      console.error('[WebSocket] Setup error:', e);
      ws.current = null;
    }
  }, [scheduleReconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
    if (ws.current && ws.current !== 'connecting' as any) {
      ws.current.close();
    }
    ws.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connectRef.current = connect;
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
