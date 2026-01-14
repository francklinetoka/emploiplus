export interface JobData {
  title: string;
  company: string;
  location: string;
  type: string;
  sector: string;
  description: string;
  salary: string;
}

export interface FormationData {
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  price: string;
}

const API_URL = "http://localhost:5000/api";
import { authHeaders } from '@/lib/headers';

export const api = {

  // Auth

  loginAdmin: (email: string, password: string) =>

    fetch(`${API_URL}/admin/login`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ email, password }),

    }).then(res => res.json()),

  // Jobs

  getJobs: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => { if (v !== undefined && v !== null) acc[k] = String(v); return acc; }, {} as Record<string,string>))}` : '';
    return fetch(`${API_URL}/jobs${qs}`).then(res => res.json());
  },

  createJob: (job: JobData) =>

    fetch(`${API_URL}/jobs`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(job),

    }).then(res => res.json()),

  updateJob: (id: string, job: JobData) =>

    fetch(`${API_URL}/jobs/${id}`, {

      method: "PUT",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(job),

    }).then(res => res.json()),

  toggleJobPublish: (id: string, published: boolean) =>

    fetch(`${API_URL}/jobs/${id}/publish`, {

      method: "PATCH",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ published }),

    }).then(res => res.json()),

  deleteJob: (id: string) => fetch(`${API_URL}/jobs/${id}`, { method: "DELETE" }),

  // Formations

  getFormations: () => fetch(`${API_URL}/formations`).then(res => res.json()),

  createFormation: (formation: FormationData) =>

    fetch(`${API_URL}/formations`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(formation),

    }).then(res => res.json()),

  // Admins

  getAdmins: () => fetch(`${API_URL}/admins`).then(res => res.json()),

  // Site notifications (admin)
  createSiteNotification: (payload: { title: string; message?: string; target?: string; category?: string | null; image_url?: string | null; link?: string | null; }) => {
    const adminToken = localStorage.getItem('adminToken');
    const headers = adminToken ? authHeaders('application/json', 'adminToken') : authHeaders('application/json');
    return fetch(`${API_URL}/admin/site-notifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).then(res => res.json());
  },

  // List site notifications (admin)
  getSiteNotifications: () => {
    const adminToken = localStorage.getItem('adminToken');
    const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
    return fetch(`${API_URL}/site-notifications`, { headers }).then(res => res.json());
  },

  // Delete a site notification (admin)
  deleteSiteNotification: (id: string | number) => {
    const adminToken = localStorage.getItem('adminToken');
    const headers = adminToken ? authHeaders(undefined, 'adminToken') : authHeaders();
    return fetch(`${API_URL}/admin/site-notifications/${id}`, { method: 'DELETE', headers }).then(res => res.json());
  },

  // Users

  getUsers: () => fetch(`${API_URL}/users`).then(res => res.json()),

  createUser: (user: { full_name: string; email: string; user_type: string }) =>

    fetch(`${API_URL}/users`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(user),

    }).then(res => res.json()),

  updateUser: (id: string, user: { full_name?: string; email?: string; is_blocked?: boolean }) =>

    fetch(`${API_URL}/users/${id}`, {

      method: "PUT",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(user),

    }).then(res => res.json()),

  deleteUser: (id: string) => fetch(`${API_URL}/users/${id}`, { method: "DELETE" }),

  // Stats

  getStats: () => fetch(`${API_URL}/stats`).then(res => res.json()),

};