import axios, { InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface JwtPayloadExp {
  exp: number;
}
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JwtPayloadExp = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true;
  }
};

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return config;

  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const gameToken = localStorage.getItem('gameToken');

  if (accessToken && isTokenExpired(accessToken) && refreshToken && !isTokenExpired(refreshToken)) {
    try {
      const res = await axios.post<RefreshResponse>(`${config.baseURL}/user/refresh-access-token`, {}, {
        headers: { 'refresh-token': refreshToken }
      });
      accessToken = res.data.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
    } catch (err) {
      console.error('Session expired', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }


  if (accessToken && !isTokenExpired(accessToken)) {
    config.headers['access-token'] = accessToken;
  }

  if (gameToken) {
    if (isTokenExpired(gameToken)) {
      localStorage.removeItem('gameToken');
      if (window.location.pathname.startsWith('/game/')) {
        window.location.href = '/join';
      }
    } else {
      config.headers['game-token'] = gameToken;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    if (error.response?.status === 401) {
      const isGamePage = window.location.pathname.startsWith('/game');
      const hasAccessToken = !!localStorage.getItem('accessToken');

      if (isGamePage && !hasAccessToken) {
        // Participant got kicked out
        localStorage.removeItem('gameToken');
        window.location.href = '/join';
      } else if (hasAccessToken) {
        // Host might have an issue with gameToken or accessToken
        localStorage.removeItem('gameToken');
        // We only go to login if we explicitly see it's a user auth issue or if skip refresh
        if (!isGamePage) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        } else {
          // On game page, just go to join/home to retry
          window.location.href = '/';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;