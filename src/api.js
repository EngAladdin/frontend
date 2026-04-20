// src/api.js — Axios client with auth token injection
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('dl_token');
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dl_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (username, password) =>
  axios.post('/auth/login', { username, password });

export const logout = () => API.post('/auth/logout');

export const getSessions = (params) => API.get('/sessions', { params });
export const getSession = (id) => API.get(`/sessions/${id}`);
export const getSessionExplain = (id) => API.get(`/sessions/${id}/explain`);
export const getSessionKG = (id) => API.get(`/sessions/${id}/kg`);
export const getSessionEvents = (id) => API.get(`/sessions/${id}/events`);

export const getDecisions = (params) => API.get('/decisions', { params });

export const getRules = () => API.get('/rules');
export const createRule = (rule) => API.post('/rules', { rule });
export const updateRule = (id, rule) => API.put(`/rules/${id}`, { rule });
export const deleteRule = (id) => API.delete(`/rules/${id}`);

export const getMetrics = () => API.get('/metrics');
export const getPools = () => API.get('/pools');
export const getSuggestions = () => API.get('/suggestions');

export const exportSessionsCSV = () =>
  API.get('/export/sessions.csv', { responseType: 'blob' });
export const exportDecisionsJSON = () =>
  API.get('/export/decisions.json', { responseType: 'blob' });

export default API;
