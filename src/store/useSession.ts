import { create } from 'zustand';
import api from '@/lib/api';
import { Question } from '@/types';
import { isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';

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
  activatedAt: number | null;
  hasAnswered: boolean;
  resultsDisplayed: boolean;
  questionStats: Array<{ choiceId: string; count: number }> | null;
  leaderboard: Array<{ participantId: string; nickname: string; score: number }> | null;
  loading: boolean;
  error: string | null;
  isFetching: boolean;

  setGameToken: (token: string | null) => void;
  createSession: (quizId: string) => Promise<void>;
  joinSession: (publicKey: string, nickname: string) => Promise<void>;
  fetchSession: () => Promise<void>;
  startSession: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  showResults: () => Promise<void>;
  fetchQuestionStats: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  addParticipant: (participant: { participant_id: string; nickname: string; role: string }) => void;
  setParticipants: (participants: Array<{ participant_id: string; nickname: string; role: string }>) => void;
  removeParticipant: (participantId: string) => void;
  getCurrentQuestion: () => Promise<void>;
  submitResponse: (choiceIds: string[]) => Promise<void>;
  answerBuzzer: (participantId: string, isCorrect: boolean) => Promise<void>;
  quitSession: () => Promise<void>;
  reset: () => void;
}



interface SessionResponse {
  session_id: string;
  public_key: string;
  game_token: string;
  status: 'LOBBY' | 'QUESTION_ACTIVE' | 'QUESTION_CLOSED' | 'FINISHED';
  participants: Array<{ participant_id: string; nickname: string; role: string }>;
  current_question?: Question | null;
  activated_at?: number | null;
  has_answered?: boolean;
}

interface JoinResponse {
  game_token: string;
}

const getInitialState = () => {
  if (typeof window === 'undefined') return { gameToken: null, participantId: null, role: null, sessionId: null };
  const token = localStorage.getItem('gameToken');
  if (!token) return { gameToken: null, participantId: null, role: null, sessionId: null };
  try {
    const decoded = jwtDecode<GameTokenPayload>(token);
    return {
      gameToken: token,
      participantId: decoded.participantId,
      role: decoded.role,
      sessionId: decoded.sessionId
    };
  } catch {
    return { gameToken: token, participantId: null, role: null, sessionId: null };
  }

};

const initialState = getInitialState();

export const useSession = create<SessionState>((set, get) => ({
  sessionId: initialState.sessionId,
  publicKey: null,
  gameToken: initialState.gameToken,
  status: null,
  currentQuestion: null,
  participants: [],
  participantId: initialState.participantId,
  role: initialState.role,
  activatedAt: null,
  hasAnswered: false,
  resultsDisplayed: false,
  questionStats: null,
  leaderboard: null,
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
    localStorage.removeItem('gameToken');
    get().reset();
    set({ loading: true, error: null });
    try {
      const res = await api.post<SessionResponse>('/sessions/', { quiz_id: quizId });
      const { session_id, public_key, game_token } = res.data;
      get().setGameToken(game_token);
      set({ sessionId: session_id, publicKey: public_key, status: 'LOBBY' });

      const user = useAuth.getState().user;
      useSocket.getState().connect(user?.email || 'moderator');

      await get().fetchSession();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors de la création de la session';
      set({ error: message || 'Erreur inconnue' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  joinSession: async (publicKey, nickname) => {
    localStorage.removeItem('gameToken');
    get().reset();
    set({ loading: true, error: null });
    try {
      const res = await api.post<JoinResponse>('/sessions/join/', {
        session_public_key: publicKey,
        participant_nickname: nickname
      });
      const { game_token } = res.data;
      get().setGameToken(game_token);
      await get().fetchSession();

      // Connect WebSocket
      useSocket.getState().connect(nickname);
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

    if (!get().gameToken && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('gameToken');
      if (storedToken) {
        get().setGameToken(storedToken);
      }
    }

    set({ isFetching: true });
    try {
      const res = await api.get<SessionResponse>('/sessions/');
      const participantId = get().participantId;

      const normalizedParticipants = res.data.participants.map(p => ({
        ...p,
        role: p.role === 'HOST' ? 'moderator' : (p.role === 'PLAYER' ? 'user' : p.role)
      }));

      const me = normalizedParticipants.find(p => p.participant_id === participantId);

      set({
        sessionId: res.data.session_id,
        publicKey: res.data.public_key,
        status: res.data.status,
        participants: normalizedParticipants,
        currentQuestion: res.data.current_question !== undefined ? res.data.current_question : get().currentQuestion,
        activatedAt: res.data.activated_at || get().activatedAt,
        hasAnswered: res.data.has_answered ?? get().hasAnswered,
        role: me ? (me.role as 'user' | 'moderator') : get().role
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
      await api.post('/sessions/start/');
      // await get().fetchSession();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors du démarrage';
      set({ error: message || 'Erreur inconnue' });
    }
  },

  nextQuestion: async () => {
    try {
      await api.post('/sessions/next/');
      set({ resultsDisplayed: false, hasAnswered: false, questionStats: null, currentQuestion: null });
      // await get().fetchSession();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        set({ status: 'FINISHED' });
      } else {
        const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur question suivante';
        set({ error: message || 'Erreur inconnue' });
      }
    }
  },

  showResults: async () => {
    try {
      await api.post('/sessions/show-results/');
      set({ resultsDisplayed: true });
      get().fetchLeaderboard();
      if (get().role === 'moderator') {
        get().fetchQuestionStats();
      }
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors de l\'affichage des résultats';
      set({ error: message || 'Erreur inconnue' });
    }
  },

  fetchQuestionStats: async () => {
    const { currentQuestion, sessionId } = get();
    if (!currentQuestion || !sessionId) return;
    try {
      const res = await api.get(`/responses/stats/question/${currentQuestion.id}?sessionId=${sessionId}`);
      set({ questionStats: res.data });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  },

  fetchLeaderboard: async () => {
    const { sessionId, participants } = get();
    if (!sessionId) return;
    try {
      const res = await api.get<Array<{ participantId: string; score: number }>>(`/responses/leaderboard/session/${sessionId}`);
      const enriched = res.data.map(item => {
        const p = participants.find(part => part.participant_id === item.participantId);
        return { ...item, nickname: p?.nickname || 'Joueur inconnu' };
      });
      set({ leaderboard: enriched });
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    }
  },



  getCurrentQuestion: async () => {
    try {
      const res = await api.get('/sessions/current-question/');
      set({ currentQuestion: res.data });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        set({ status: 'FINISHED', currentQuestion: null });
      }
    }
  },

  addParticipant: (participant) => {
    const { participants } = get();

    // Normalize role: HOST -> moderator, PLAYER -> user
    const normalizedRole = participant.role === 'HOST' ? 'moderator' : (participant.role === 'PLAYER' ? 'user' : participant.role);
    const normalizedParticipant = { ...participant, role: normalizedRole };

    if (!participants.find((p) => p.participant_id === participant.participant_id)) {
      set({ participants: [...participants, normalizedParticipant] });
    }
  },

  setParticipants: (participants) => {
    const normalized = participants.map(p => ({
      ...p,
      role: p.role === 'HOST' ? 'moderator' : (p.role === 'PLAYER' ? 'user' : (p.role || 'user'))
    }));
    set({ participants: normalized });
  },

  removeParticipant: (participantId) => {
    const { participants } = get();
    set({
      participants: participants.filter((p) => p.participant_id !== participantId),
    });
  },

  submitResponse: async (choiceIds) => {
    const { activatedAt, currentQuestion } = get();
    if (currentQuestion && currentQuestion.timer_seconds) {
      if (!activatedAt) {
        set({ error: 'TEMPS ÉCOULÉ - Réponse refusée (Sync error)' });
        return;
      }
      const now = Date.now();
      const serverStart = activatedAt > 1000000000000 ? activatedAt : activatedAt * 1000;
      const elapsed = (now - serverStart) / 1000;
      if (elapsed > currentQuestion.timer_seconds + 0.5) {
        set({ error: 'TEMPS ÉCOULÉ - Réponse refusée' });
        return;
      }
    }

    try {
      await api.post('/sessions/submit/', { choiceIds });
      set({ hasAnswered: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        set({ hasAnswered: true, error: 'Vous avez déjà répondu à cette question.' });
      } else {
        const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors de la soumission';
        set({ error: message || 'Erreur inconnue' });
      }
    }
  },
  
  answerBuzzer: async (participantId, isCorrect) => {
    try {
      await api.post('/sessions/buzzer/answer/', { participantId, isCorrect });
      await get().fetchSession();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'Erreur lors de la validation du buzzer';
      set({ error: message || 'Erreur inconnue' });
    }
  },


  quitSession: async () => {
    try {
      await api.post('/sessions/leave/', {});
    } catch (err) {
      if (isAxiosError(err)) {
        console.error('Erreur lors du départ de la session', err.response?.status);
      } else {
        console.error('Erreur inattendue');
      }
    } finally {
      localStorage.removeItem('gameToken');
      get().reset();
    }
  },


  reset: () => {
    useSocket.getState().disconnect();
    set({
      sessionId: null,
      publicKey: null,
      gameToken: null,
      status: null,
      currentQuestion: null,
      participants: [],
      participantId: null,
      role: null,
      activatedAt: null,
      hasAnswered: false,
      resultsDisplayed: false,
      questionStats: null,
      leaderboard: null,
      error: null
    });
  }

}));
