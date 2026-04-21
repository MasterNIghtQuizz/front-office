import { create } from 'zustand';
import api from '@/lib/api';
import { Question } from '@/types';
import { isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

interface GameTokenPayload {
  sessionId: string;
  participantId: string;
  role: 'user' | 'moderator';
}

interface SessionState {
  sessionId: string | null;
  publicKey: string | null;
  gameToken: string | null;
  status: 'LOBBY' | 'QUESTION_ACTIVE' | 'QUESTION_CLOSED' | 'FINISHED' | null;
  currentQuestion: Question | null;
  participants: Array<{ participant_id: string; nickname: string; role: string }>;
  participantId: string | null;
  role: 'user' | 'moderator' | null;
  loading: boolean;
  error: string | null;
  isFetching: boolean;

  setGameToken: (token: string | null) => void;
  createSession: (quizId: string) => Promise<void>;
  joinSession: (publicKey: string, nickname: string) => Promise<void>;
  fetchSession: () => Promise<void>;
  startSession: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  getCurrentQuestion: () => Promise<void>;
  submitResponse: (choiceIds: string[]) => Promise<void>;
  reset: () => void;
}

interface SessionResponse {
  session_id: string;
  public_key: string;
  game_token: string;
  status: 'LOBBY' | 'QUESTION_ACTIVE' | 'QUESTION_CLOSED' | 'FINISHED';
  participants: Array<{ participant_id: string; nickname: string; role: string }>;
  current_question?: Question | null;
}

interface JoinResponse {
  game_token: string;
}

export const useSession = create<SessionState>((set, get) => ({
  sessionId: null,
  publicKey: null,
  gameToken: null,
  status: null,
  currentQuestion: null,
  participants: [],
  participantId: null,
  role: null,
  loading: false,
  error: null,
  isFetching: false,

  setGameToken: (token) => {
    if (token) {
      localStorage.setItem('gameToken', token);
      try {
        const decoded = jwtDecode<GameTokenPayload>(token);
        set({
          gameToken: token,
          participantId: decoded.participantId,
          role: decoded.role,
          sessionId: decoded.sessionId
        });
      } catch (e) {
        console.error('Failed to decode game token', e);
        set({ gameToken: token });
      }
    } else {
      localStorage.removeItem('gameToken');
      set({ gameToken: null, participantId: null, role: null });
    }
  },

  createSession: async (quizId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<SessionResponse>('/sessions', { quiz_id: quizId });
      const { session_id, public_key, game_token } = res.data;
      get().setGameToken(game_token);
      set({ sessionId: session_id, publicKey: public_key, status: 'LOBBY' });
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors de la création de la session';
      set({ error: message || 'Erreur inconnue' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  joinSession: async (publicKey, nickname) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<JoinResponse>('/sessions/join', {
        session_public_key: publicKey,
        participant_nickname: nickname
      });
      const { game_token } = res.data;
      get().setGameToken(game_token);
      await get().fetchSession();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors de la jonction à la session';
      set({ error: message || 'Erreur inconnue' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchSession: async () => {
    if (get().isFetching) return;
    set({ isFetching: true });
    try {
      const res = await api.get<SessionResponse>('/sessions');
      set({
        sessionId: res.data.session_id,
        publicKey: res.data.public_key,
        status: res.data.status,
        participants: res.data.participants,
        currentQuestion: res.data.current_question !== undefined ? res.data.current_question : get().currentQuestion
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        get().reset();
      }
      throw err;
    } finally {
      set({ isFetching: false });
    }
  },

  startSession: async () => {
    try {
      await api.post('/sessions/start');
      await get().fetchSession();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors du démarrage';
      set({ error: message || 'Erreur inconnue' });
    }
  },

  nextQuestion: async () => {
    try {
      await api.post('/sessions/next');
      await get().fetchSession();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        set({ status: 'FINISHED' });
      } else {
        const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur question suivante';
        set({ error: message || 'Erreur inconnue' });
      }
    }
  },

  getCurrentQuestion: async () => {
    try {
      const res = await api.get('/sessions/current-question');
      set({ currentQuestion: res.data });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        set({ status: 'FINISHED', currentQuestion: null });
      }
    }
  },

  submitResponse: async (choiceIds) => {
    try {
      await api.post('/sessions/submit', { choiceIds });
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors de la soumission';
      set({ error: message || 'Erreur inconnue' });
    }
  },

  reset: () => {
    localStorage.removeItem('gameToken');
    set({
      sessionId: null,
      publicKey: null,
      gameToken: null,
      status: null,
      currentQuestion: null,
      participants: [],
      participantId: null,
      role: null
    });
  }
}));
