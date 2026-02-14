import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('zentube_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('zentube_token');
            localStorage.removeItem('zentube_user');
            // Don't redirect if already on auth page
            if (!window.location.pathname.includes('/auth')) {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Video API
export const videoAPI = {
    getVideos: (params) => api.get('/videos', { params }),
    getVideo: (id) => api.get(`/videos/${id}`),
    uploadVideo: (data, onProgress) => api.post('/videos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
    }),
    updateVideo: (id, data) => api.put(`/videos/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteVideo: (id) => api.delete(`/videos/${id}`),
    likeVideo: (id) => api.post(`/videos/${id}/like`),
    dislikeVideo: (id) => api.post(`/videos/${id}/dislike`),
    reportVideo: (id, data) => api.post(`/videos/${id}/report`, data),
    getTrending: (params) => api.get('/videos/trending', { params }),
    getShorts: (params) => api.get('/videos/shorts', { params }),
    getRecommended: (id) => api.get(`/videos/${id}/recommended`),
};

// User API
export const userAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    getUserProfile: (id) => api.get(`/users/${id}`),
    getUserVideos: (id, params) => api.get(`/users/${id}/videos`, { params }),
    subscribe: (id) => api.post(`/users/${id}/subscribe`),
    getWatchHistory: () => api.get('/users/history'),
    addToHistory: (videoId) => api.post(`/users/history/${videoId}`),
    addToWatchHistory: (videoId) => api.post(`/users/history/${videoId}`),
    getWatchLater: () => api.get('/users/watchlater'),
    toggleWatchLater: (videoId) => api.post(`/users/watchlater/${videoId}`),
    getSubscriptionFeed: (params) => api.get('/users/subscriptions/feed', { params }),
};

// Comment API
export const commentAPI = {
    getComments: (videoId, params) => api.get(`/comments/${videoId}`, { params }),
    addComment: (videoId, data) => api.post(`/comments/${videoId}`, data),
    deleteComment: (id) => api.delete(`/comments/${id}`),
    likeComment: (id) => api.post(`/comments/${id}/like`),
};

// Search API
export const searchAPI = {
    search: (params) => api.get('/search', { params }),
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getReports: (params) => api.get('/admin/reports', { params }),
    updateReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
    resolveReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
    getVideos: (params) => api.get('/admin/videos', { params }),
    deleteVideo: (id) => api.delete(`/admin/videos/${id}`),
};

export default api;
