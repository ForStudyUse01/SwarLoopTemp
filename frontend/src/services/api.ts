import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  register: (data: { email: string; password: string; displayName: string }) =>
    api.post('/auth/signup', data),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),
  
  refreshToken: () => api.post('/auth/refresh', {
    refreshToken: localStorage.getItem('refreshToken')
  }),
  
  updateProfile: (data: any) => api.patch('/users/me', data),
};

// Music API
export const musicAPI = {
  getMusic: (params?: any) => api.get('/music', { params }),
  
  getMusicById: (id: string) => api.get(`/music/${id}`),
  
  createMusic: (data: any) => api.post('/music', data),
  
  deleteMusic: (id: string) => api.delete(`/music/${id}`),
};

// Playlist API
export const playlistAPI = {
  getPlaylists: () => api.get('/playlists'),
  
  getPlaylistById: (id: string) => api.get(`/playlists/${id}`),
  
  createPlaylist: (data: any) => api.post('/playlists', data),
  
  updatePlaylist: (id: string, data: any) => api.patch(`/playlists/${id}`, data),
  
  deletePlaylist: (id: string) => api.delete(`/playlists/${id}`),
};

// Recommendation API
export const recommendationAPI = {
  getRecommendations: (data: any) => api.post('/recommendations', data),
  
  getRecommendationHistory: (params?: any) => api.get('/recommendations/history', { params }),
};

// Article API
export const articleAPI = {
  getArticles: (params?: any) => api.get('/articles', { params }),
  
  getArticleById: (id: string) => api.get(`/articles/${id}`),
  
  createArticle: (data: any) => api.post('/articles', data),
  
  updateArticle: (id: string, data: any) => api.patch(`/articles/${id}`, data),
  
  deleteArticle: (id: string) => api.delete(`/articles/${id}`),
};

// Meditation API
export const meditationAPI = {
  getMeditations: (params?: any) => api.get('/meditations', { params }),
  
  getMeditationById: (id: string) => api.get(`/meditations/${id}`),
};

// Event API
export const eventAPI = {
  trackEvent: (data: { type: string; data?: any }) => api.post('/events', data),
};

// Admin API
export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
  
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  
  banUser: (id: string, data: { isActive: boolean }) => api.post(`/admin/users/${id}/ban`, data),
};

// ML Service API
export const mlAPI = {
  analyzeTextMood: (data: { text: string; confidence_threshold?: number }) =>
    api.post('/ml/analyze-text-mood', data),
  
  analyzeAudioMood: (data: { audio_features: any }) =>
    api.post('/ml/analyze-audio-mood', data),
  
  recommendMusic: (data: { user_id: string; mood_emotions: any; limit?: number }) =>
    api.post('/ml/recommend-music', data),
  
  extractAudioFeatures: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ml/extract-audio-features', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
