import apiClient from './api';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'model';
  content: string;
  provider?: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  context_type: string;
  target_career_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatConversationDetail extends ChatConversation {
  messages: ChatMessage[];
}

export const mentorService = {
  createConversation: async (data: { title: string; target_career_id?: string; context_type?: string }) => {
    const response = await apiClient.post('/mentor/conversations', data);
    return response.data;
  },

  getConversations: async () => {
    const response = await apiClient.get('/mentor/conversations');
    return response.data;
  },

  getConversation: async (id: string) => {
    const response = await apiClient.get(`/mentor/conversations/${id}`);
    return response.data;
  },

  updateConversation: async (id: string, data: { title: string }) => {
    const response = await apiClient.patch(`/mentor/conversations/${id}`, data);
    return response.data;
  },

  deleteConversation: async (id: string) => {
    const response = await apiClient.delete(`/mentor/conversations/${id}`);
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string) => {
    const response = await apiClient.post(`/mentor/conversations/${conversationId}/messages`, { content });
    return response.data;
  }
};
