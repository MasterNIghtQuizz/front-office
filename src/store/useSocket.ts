import { create } from 'zustand';
import { useSession } from './useSession';
import { useAuth } from './useAuth';

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  isConnecting: boolean;
  connect: (userName: string) => void;
  disconnect: () => void;
  sendMessage: (type: string, payload: any) => void;
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
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws';
    
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

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WS Message:', message);
        
        const { type, payload } = message;
        const sessionStore = useSession.getState();

        switch (type) {
          case 'user_online':
            if (payload.userId && payload.userName) {
              sessionStore.addParticipant({
                participant_id: payload.userId,
                nickname: payload.userName,
                role: payload.role || 'user'
              });
            }
            break;
          case 'user_offline':
            if (payload.userId) {
              sessionStore.removeParticipant(payload.userId);
            }
            break;
          default:
            // Handle other message types if needed
            break;
        }
      } catch (e) {
        console.error('Failed to parse WS message:', e);
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

  sendMessage: (type: string, payload: any) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }
}));
