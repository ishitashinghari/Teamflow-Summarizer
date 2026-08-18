import axios from 'axios';
import { auth } from './firebase';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Automatic Bearer ID Token Injection Interceptor
API.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const userAPI = {
  syncUser: (data) => API.post('/users/sync', data),
  getMe: () => API.get('/users/me'),
  updateProfile: (data) => {
    if (data instanceof FormData) {
      return API.put('/users/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return API.put('/users/me', data);
  },
};

export const groupAPI = {
  getGroups: () => API.get('/groups'),
  createGroup: (data) => API.post('/groups', data),
  joinGroup: (inviteCode) => API.post('/groups/join', { inviteCode }),
  removeMember: (groupId, userId) => API.delete(`/groups/${groupId}/members/${userId}`),
};

export const messageAPI = {
  getMessages: (groupId, page = 1) => API.get(`/messages/group/${groupId}?page=${page}&limit=50`),
  sendMessage: (formData) =>
    API.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  editMessage: (messageId, text) => API.put(`/messages/${messageId}`, { text }),
  deleteMessage: (messageId) => API.delete(`/messages/${messageId}`),
  markAsRead: (groupId) => API.post(`/messages/group/${groupId}/read`),
  searchMessages: (groupId, query) => API.get(`/messages/group/${groupId}/search?q=${encodeURIComponent(query)}`),
};

export const aiAPI = {
  summarizeUnread: (groupId, localUnreadCount) => API.post('/ai/summarize', { groupId, localUnreadCount }),
  chatWithBot: (history, query) => API.post('/ai/chat', { history, query }),
};

export default API;