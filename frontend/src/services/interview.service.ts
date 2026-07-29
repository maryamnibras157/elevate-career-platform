import apiClient from './api';
export interface Career {
  id: string;
  title: string;
}

export interface InterviewAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  suggested_answer?: string;
  evaluated_at?: string;
}

export interface InterviewQuestion {
  id: string;
  session_id: string;
  question_text: string;
  question_type: string;
  category?: string;
  difficulty?: string;
  order: number;
  answer?: InterviewAnswer;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  career_id?: string;
  career?: Career;
  interview_type: string;
  difficulty: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  total_questions: number;
  overall_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  created_at: string;
  started_at: string;
  completed_at?: string;
}

export interface InterviewSessionDetail extends InterviewSession {
  questions: InterviewQuestion[];
}

export interface InterviewSummary {
  total_interviews: number;
  average_score: number;
  best_score: number;
  technical_score: number;
  behavioral_score: number;
  readiness_label: string;
}

export const interviewService = {
  createSession: async (data: { career_id?: string; interview_type: string; difficulty: string; num_questions: number }) => {
    const response = await apiClient.post('/interviews/sessions', data);
    return response.data;
  },

  getSessions: async () => {
    const response = await apiClient.get('/interviews/sessions');
    return response.data;
  },

  getSession: async (id: string) => {
    const response = await apiClient.get(`/interviews/sessions/${id}`);
    return response.data;
  },

  submitAnswer: async (sessionId: string, questionId: string, answer_text: string) => {
    const response = await apiClient.post(`/interviews/sessions/${sessionId}/answers`, { question_id: questionId, answer_text });
    return response.data;
  },

  completeSession: async (sessionId: string) => {
    const response = await apiClient.post(`/interviews/sessions/${sessionId}/complete`);
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/interviews/sessions/${sessionId}`);
    return response.data;
  },

  getSummary: async () => {
    const response = await apiClient.get('/interviews/summary');
    return response.data;
  }
};
