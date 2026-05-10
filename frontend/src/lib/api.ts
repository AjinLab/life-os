import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ CAPTURES ============

export const capturesApi = {
  create: (data: { content: string; type: string }) =>
    api.post('/api/captures', data),
  list: (status?: string) =>
    api.get('/api/captures', { params: status ? { status } : {} }),
  process: (id: string, new_status: string) =>
    api.patch(`/api/captures/${id}`, null, { params: { new_status } }),
};

// ============ GOALS ============

export const goalsApi = {
  create: (data: { title: string; type?: string; parent_id?: string; due_date?: string }) =>
    api.post('/api/goals/', data),
  list: (status?: string) =>
    api.get('/api/goals/', { params: status ? { status } : {} }),
  get: (id: string) =>
    api.get(`/api/goals/${id}`),
};

// ============ TASKS ============

export const tasksApi = {
  create: (data: { title: string; status?: string; priority?: string; goal_id?: string; source?: string }) =>
    api.post('/api/tasks/', data),
  list: (params?: { status?: string; goal_id?: string; skip?: number; limit?: number }) =>
    api.get('/api/tasks/', { params }),
  get: (id: number) =>
    api.get(`/api/tasks/${id}`),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/api/tasks/${id}`, data),
  delete: (id: number) =>
    api.delete(`/api/tasks/${id}`),
};

// ============ HABITS ============

export const habitsApi = {
  create: (data: { name: string; cue?: string; target_per_wk?: number }) =>
    api.post('/api/habits/', data),
  list: (activeOnly?: boolean) =>
    api.get('/api/habits/', { params: { active_only: activeOnly ?? true } }),
  today: () =>
    api.get('/api/habits/today'),
  get: (id: string) =>
    api.get(`/api/habits/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/api/habits/${id}`, data),
  delete: (id: string) =>
    api.delete(`/api/habits/${id}`),
  log: (id: string, data: { completed: boolean; note?: string; log_date?: string }) =>
    api.post(`/api/habits/${id}/log`, data),
  getLogs: (id: string, days?: number) =>
    api.get(`/api/habits/${id}/logs`, { params: { days: days || 30 } }),
};

// ============ REFLECTIONS ============

export const reflectionsApi = {
  create: (data: { week_start: string; score: number; wins?: string; struggles?: string; focus_next?: string }) =>
    api.post('/api/reflections/', data),
  list: (limit?: number) =>
    api.get('/api/reflections/', { params: { limit: limit || 12 } }),
  latest: () =>
    api.get('/api/reflections/latest'),
  get: (id: string) =>
    api.get(`/api/reflections/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/api/reflections/${id}`, data),
};

// ============ HOME ============

export const homeApi = {
  dashboard: () =>
    api.get('/api/home/dashboard'),
};

// ============ AI ============

export const aiApi = {
  weeklyBriefing: () =>
    api.post('/api/ai/weekly-briefing', {}),
  processCapture: (captureId: string) =>
    api.post('/api/ai/process-capture', { capture_id: captureId }),
  reflectionSummary: (reflectionId: string) =>
    api.post('/api/ai/reflection-summary', { reflection_id: reflectionId }),
};

export default api;
