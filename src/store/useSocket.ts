import { create } from 'zustand';
import { useSession } from './useSession';
import { useAuth } from './useAuth';
import { WebSocketMessage } from '@/types';

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  isConnecting: boolean;
  connect: (userName: string) => void;
  disconnect: () => void;
  sendMessage: <T>(type: string, payload: T) => void;
}

export const useSocket = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: (userName: string) => {
    // Avoid duplicate connections
    const { socket, isConnecting, isConnected } = get();
    if (isConnected || isConnecting) return;
    if (socket && socket.readyState === WebSocket.OPEN) return;

    // mark as connecting immediately to prevent races
    set({ isConnecting: true, error: null });

    const accessToken = useAuth.getState().token;
    const gameToken = useSession.getState().gameToken;

    // We prefer gameToken for session-specific actions, but accessToken might be needed for the initial handshake if the gateway requires it
    // The gateway's hookAccessToken and hookGameToken should both be able to populate request.user

    const getWebSocketUrl = () => {
      const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;

      // If we are in the browser and the API URL is missing or looks like an internal K8s name
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isInternalK8sName = publicApiUrl && (publicApiUrl.includes('api-gateway') || !publicApiUrl.includes('.'));

        if (!publicApiUrl || isInternalK8sName) {
          // If the frontend and backend share the same domain (common in Ingress setup)
          // we fallback to the current origin.
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          // In production, we typically proxy /api to the gateway.
          // If the WS is also proxied, we use the current host.
          return `${protocol}//${window.location.host}/ws`;
        }
      }

      const baseUrl = publicApiUrl || 'http://localhost:3010';
      const wsBaseUrl = baseUrl.replace(/^http/, 'ws');
      return `${wsBaseUrl}/ws`;
    };

    const wsUrl = getWebSocketUrl();

    // Construct the URL with available tokens
    const params = new URLSearchParams();
    if (accessToken) params.append('access-token', accessToken);
    if (gameToken) params.append('game-token', gameToken);
    params.append('userName', userName);

    const url = `${wsUrl}?${params.toString()}`;

    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(url);
    // set socket early so other callers see a non-null socket
    set({ socket: ws });

    ws.onopen = () => {
      console.log('WebSocket connected');
      set({ isConnected: true, isConnecting: false, error: null });
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      set({ isConnected: false, socket: null, isConnecting: false });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ error: 'WebSocket connection error', isConnecting: false });
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage<any> = JSON.parse(event.data);
        if (process.env.NODE_ENV === 'development') {
          console.log('WS Message type:', message.type);
        }

        const { type, payload } = message;
        const sessionStore = useSession.getState();

        switch (type) {
          case 'user_online':
            const onlinePayload = payload as { userId: string; userName: string; role?: string };
            if (onlinePayload.userId && onlinePayload.userName) {
              sessionStore.addParticipant({
                participant_id: onlinePayload.userId,
                nickname: onlinePayload.userName,
                role: onlinePayload.role || 'user'
              });
            }
            break;
          case 'user_offline':
            const offlinePayload = payload as { userId: string };
            if (offlinePayload.userId) {
              sessionStore.removeParticipant(offlinePayload.userId);
            }
            break;
          default:
            if (process.env.NODE_ENV === 'development') {
              console.log('Received unhandled WS message type:', type);
            }
            break;
        }
      } catch (e) {
        console.error('Failed to parse WS message');
      }
    };

    // ws already set above; keep isConnecting until onopen/onclose
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: <T>(type: string, payload: T) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      const message: WebSocketMessage<T> = { type, payload };
      socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }
}));
