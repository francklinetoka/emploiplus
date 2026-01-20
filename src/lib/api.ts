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

// API URL dynamique : détecte automatiquement l'adresse IP du backend
const getAPIURL = () => {
  // En production, utiliser la variable d'environnement si disponible
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // En développement, déterminer l'adresse du backend en fonction de l'adresse actuelle
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // Si on est sur localhost, utiliser localhost
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    
    // Si on est sur une adresse IP du réseau local, utiliser la même adresse IP pour le backend
    if (currentHost.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return `http://${currentHost}:5000/api`;
    }
  }
  
  // Fallback par défaut
  return 'http://localhost:5000/api';
};

const API_URL = getAPIURL();
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
    const queryParams = params ? { ...params, limit: 12 } : { limit: 12 };
    const qs = `?${new URLSearchParams(Object.entries(queryParams).reduce((acc, [k, v]) => { if (v !== undefined && v !== null) acc[k] = String(v); return acc; }, {} as Record<string,string>))}`;
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

  getFormations: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => { if (v !== undefined && v !== null) acc[k] = String(v); return acc; }, {} as Record<string,string>))}` : '';
    return fetch(`${API_URL}/formations${qs}`).then(res => res.json());
  },

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

  getAdminStats: () => {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_URL}/admin/stats`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    }).then(res => res.json());
  },

  // Match Score & Career Roadmap

  getMatchScore: (jobId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/jobs/${jobId}/match-score`, { headers })
      .then(res => res.json());
  },

  getAllMatchScores: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/jobs/match-scores/all`, { headers })
      .then(res => res.json());
  },

  generateCareerRoadmap: (targetJobId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/career/roadmap/${targetJobId}`, { headers })
      .then(res => res.json());
  },

  getTargetPositions: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/career/target-positions`, { headers })
      .then(res => res.json());
  },

  deleteTargetPosition: (positionId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/career/target-positions/${positionId}`, {
      method: 'DELETE',
      headers
    }).then(res => res.json());
  },

  addJobRequirements: (jobId: number, requirements: Array<{ skill: string; is_required: boolean; category?: string }>) => {
    const token = localStorage.getItem('adminToken');
    const headers = authHeaders(undefined, 'adminToken');
    return fetch(`${API_URL}/admin/jobs/${jobId}/requirements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requirements })
    }).then(res => res.json());
  },

  addFormationSkills: (formationId: number, skills: string[]) => {
    const headers = authHeaders(undefined, 'adminToken');
    return fetch(`${API_URL}/admin/formations/${formationId}/skills`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ skills })
    }).then(res => res.json());
  },

  // FOLLOWS & CONNECTIONS
  followUser: (followingId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/${followingId}`, {
      method: 'POST',
      headers,
    }).then(res => res.json());
  },

  unfollowUser: (followingId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/${followingId}`, {
      method: 'DELETE',
      headers,
    }).then(res => res.json());
  },

  getNetworkStats: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/stats`, {
      headers,
    }).then(res => res.json());
  },

  getFollowSuggestions: (limit = 10) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/suggestions?limit=${limit}`, {
      headers,
    }).then(res => res.json());
  },

  getNetworkActivity: (limit = 20) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/activity?limit=${limit}`, {
      headers,
    }).then(res => res.json());
  },

  getFollowingUsers: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/following`, {
      headers,
    }).then(res => res.json());
  },

  getFollowerUsers: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/followers`, {
      headers,
    }).then(res => res.json());
  },

  isFollowing: (userId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/follows/${userId}/is-following`, {
      headers,
    }).then(res => res.json());
  },

  blockUser: (blockedUserId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/blocks/${blockedUserId}`, {
      method: 'POST',
      headers,
    }).then(res => res.json());
  },

  unblockUser: (blockedUserId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/blocks/${blockedUserId}`, {
      method: 'DELETE',
      headers,
    }).then(res => res.json());
  },

  // MESSAGING
  getConversations: (limit = 50) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations?limit=${limit}`, {
      headers,
    }).then(res => res.json());
  },

  createConversation: (recipientId: number, subjectId?: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ recipientId, subjectId }),
    }).then(res => res.json());
  },

  getMessages: (conversationId: number, offset = 0, limit = 20) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations/${conversationId}/messages?offset=${offset}&limit=${limit}`, {
      headers,
    }).then(res => res.json());
  },

  sendMessage: (conversationId: number, receiverId: number, content: string) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ conversationId, receiverId, content }),
    }).then(res => res.json());
  },

  markMessageAsRead: (messageId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers,
    }).then(res => res.json());
  },

  markConversationAsRead: (conversationId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations/${conversationId}/read`, {
      method: 'PUT',
      headers,
    }).then(res => res.json());
  },

  toggleMessageImportant: (messageId: number, isImportant: boolean) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/${messageId}/important`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isImportant }),
    }).then(res => res.json());
  },

  deleteMessage: (messageId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers,
    }).then(res => res.json());
  },

  deleteConversation: (conversationId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers,
    }).then(res => res.json());
  },

  getUnreadMessageCount: () => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/unread/count`, {
      headers,
    }).then(res => res.json());
  },

  getMessageSubjects: (companyId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/message-subjects/${companyId}`, {
      headers,
    }).then(res => res.json());
  },

  createMessageSubject: (subjectName: string, subjectDescription?: string, displayOrder?: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/message-subjects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ subjectName, subjectDescription, displayOrder }),
    }).then(res => res.json());
  },

  reportMessage: (messageId: number, reason: string, reportType = 'report') => {
    const headers = authHeaders();
    return fetch(`${API_URL}/messages/${messageId}/report`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason, reportType }),
    }).then(res => res.json());
  },

  checkConversationExists: (recipientId: number) => {
    const headers = authHeaders();
    return fetch(`${API_URL}/conversations/check/${recipientId}`, {
      headers,
    }).then(res => res.json());
  },

};