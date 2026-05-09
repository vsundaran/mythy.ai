import api from './api';

export interface ISource {
  title: string;
  url: string;
}

export interface IMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    result?: 'True' | 'False' | 'Misleading';
    sources?: ISource[];
  };
  createdAt: string;
}

export interface IChat {
  _id?: string;
  chatId: string;
  title: string;
  userId: string;
  categoryIcon?: string;
  isAuthentic?: boolean;
  category?: string;
  messages: IMessage[];
  createdAt: string;
  updatedAt: string;
}

export const sendChatMessage = async (question: string, chatId?: string, isAuthentic?: boolean, category?: string): Promise<IChat> => {
  const response = await api.post('/chat', { question, chatId, isAuthentic, category });
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to send message');
};

export const fetchUserChats = async (): Promise<IChat[]> => {
  const response = await api.get('/chat');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch chats');
};

export const fetchChatDetails = async (chatId: string): Promise<IChat> => {
  const response = await api.get(`/chat/${chatId}`);
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch chat details');
};

export const deleteMultipleChats = async (chatIds: string[]): Promise<any> => {
  const response = await api.delete('/chat', { data: { chatIds } });
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to delete chats');
};

export const deleteAllUserChats = async (): Promise<any> => {
  const response = await api.delete('/chat/all');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to delete all chats');
};
