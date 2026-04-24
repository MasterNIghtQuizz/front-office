import { create } from 'zustand';
import { useSession } from './useSession';
import { WebSocketMessage } from '@/types';

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  isConnecting: boolean;
  connectTimeout: ReturnType<typeof setTimeout> | null;
  connect: (userName: string) => void;
  disconnect: () => void;
  sendMessage: <T>(type: string, payload: T) => void;
}

export const useSocket = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connectTimeout: null,

  connect: (userName: string = 'Anonymous') => {
    const { isConnecting, isConnected, socket, connectTimeout } = get();
    if (isConnecting || isConnected) return;

    if (connectTimeout) clearTimeout(connectTimeout);

    if (socket) {
      try {
        socket.close();
      } catch (e) {
        console.error('Failed to close WebSocket', e);
      }
    }

    set({ isConnecting: true, error: null });

    const gameTokenNow = localStorage.getItem('gameToken');

    const getWebSocketUrl = () => {
      const publicWsUrl = process.env.NEXT_PUBLIC_WS_URL;
      if (publicWsUrl) return publicWsUrl;

      const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Client-side: If we're in the browser, we should try to use the current host
      // especially if publicApiUrl is an internal K8s name like 'api-gateway'
      if (typeof window !== 'undefined') {
        const isInternalHost = publicApiUrl && (
          publicApiUrl.includes('api-gateway') || 
          publicApiUrl.includes('localhost') || 
          publicApiUrl.includes('127.0.0.1')
        );

        // If we have a public API URL and it's NOT an internal host, use it
        if (publicApiUrl && !isInternalHost) {
          const url = new URL(publicApiUrl);
          const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
          return `${wsProtocol}//${url.host}/ws`;
        }

        // Fallback to current domain (BFF/Proxy pattern or same-domain deployment)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}/ws`;
      }

      // Server-side fallback (SSR)
      if (publicApiUrl && publicApiUrl.startsWith('http')) {
        const url = new URL(publicApiUrl);
        const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${wsProtocol}//${url.host}/ws`;
      }

      // Default fallback
      return 'ws://localhost:3010/ws';
    };

    const wsUrl = getWebSocketUrl();
    const params = new URLSearchParams();
    if (gameTokenNow) params.append('game-token', gameTokenNow);
    params.append('userName', userName);

    const url = `${wsUrl}?${params.toString()}`;

    console.debug('Connecting to WebSocket...', { url });
    const ws = new WebSocket(url);
    set({ socket: ws, connectTimeout: null });

    ws.onopen = () => {
      console.debug('WebSocket connected');
      set({ isConnected: true, isConnecting: false, error: null });
    };

    ws.onclose = (event) => {
      console.debug('WebSocket closed:', event.code, event.reason);
      const wasConnecting = get().isConnecting;
      set({ isConnected: false, socket: null, isConnecting: false });

      if (!wasConnecting) {
        setTimeout(() => {
          const state = get();
          if (!state.isConnecting && !state.isConnected) {
            state.connect(userName);
          }
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ error: 'WebSocket connection error', isConnecting: false });
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage<unknown> = JSON.parse(event.data);
        const { type, payload } = message;
        const sessionStore = useSession.getState();

        switch (type) {
          case 'user_online':
            const onlinePayload = payload as { participant_id: string; nickname: string; role?: string };
            if (onlinePayload.participant_id && onlinePayload.nickname) {
              sessionStore.addParticipant({
                participant_id: onlinePayload.participant_id,
                nickname: onlinePayload.nickname,
                role: onlinePayload.role || 'user'
              });
            }
            break;

          case 'joined_session':
          case 'participants_update':
            const syncPayload = payload as {
              sessionId: string;
              participants?: Array<{ participant_id: string; nickname: string; role: string }>;
              activated_at?: number;
            };
            if (syncPayload.participants) {
              sessionStore.setParticipants(syncPayload.participants);
            }
            if (syncPayload.activated_at) {
              useSession.setState({ activatedAt: syncPayload.activated_at });
            }
            break;

          case 'user_offline': {
            const offlinePayload = payload as { participant_id: string };
            if (offlinePayload.participant_id) {
              sessionStore.removeParticipant(offlinePayload.participant_id);
            }
            break;
          }

          case 'session_started':
          case 'session_next_question': {
            const questionPayload = payload as { activated_at?: number };
            if (questionPayload.activated_at) {
              useSession.setState({ activatedAt: questionPayload.activated_at });
            }
            sessionStore.fetchSession();
            break;
          }

          case 'session_ended':
            sessionStore.fetchSession();
            break;
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };
  },

  disconnect: () => {
    const { socket, connectTimeout } = get();
    if (connectTimeout) {
      clearTimeout(connectTimeout);
    }
    if (socket) {
      socket.close();
    }
    set({ socket: null, isConnected: false, isConnecting: false, connectTimeout: null });
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
