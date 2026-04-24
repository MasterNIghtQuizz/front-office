export interface User {
  id: string;
  email: string;
  nickname?: string;
  role: 'user' | 'admin';
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
}

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    }
  }
}

export interface Question {
  id: string;
  label: string;
  type: string;
  order_index: number;
  timer_seconds: number;
  quiz_id: string;
  choices?: Choice[];
  createdAt: string;
  updatedAt: string;
}


export interface CreateQuestionRequest {
  label: string;
  type: string;
  order_index: number;
  timer_seconds: number;
  quiz_id: string;
}

export interface Choice {
  id: string;
  text: string;
  is_correct: boolean;
  question_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChoiceRequest {
  text: string;
  is_correct: boolean;
  question_id: string;
}
