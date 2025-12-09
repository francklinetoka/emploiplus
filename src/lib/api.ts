// src/lib/api.ts

const API_URL = "http://localhost:5000/api";

export const api = {

  // Auth

  loginAdmin: (email: string, password: string) =>

    fetch(`${API_URL}/admin/login`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ email, password }),

    }).then(res => res.json()),

  // Jobs

  getJobs: () => fetch(`${API_URL}/jobs`).then(res => res.json()),

  createJob: (job: any) =>

    fetch(`${API_URL}/jobs`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(job),

    }).then(res => res.json()),

  updateJob: (id: string, job: any) =>

    fetch(`${API_URL}/jobs/${id}`, {

      method: "PUT",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(job),

    }).then(res => res.json()),

  toggleJobPublish: (id: string, published: boolean) =>

    fetch(`${API_URL}/jobs/${id}/publish`, {

      method: "PATCH",

      headers: "application/json",

      body: JSON.stringify({ published }),

    }).then(res => res.json()),

  deleteJob: (id: string) => fetch(`${API_URL}/jobs/${id}`, { method: "DELETE" }),

  // Formations

  getFormations: () => fetch(`${API_URL}/formations`).then(res => res.json()),

  createFormation: (formation: any) =>

    fetch(`${API_URL}/formations`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(formation),

    }).then(res => res.json()),

  // Admins

  getAdmins: () => fetch(`${API_URL}/admins`).then(res => res.json()),

  // Stats

  getStats: () => fetch(`${API_URL}/stats`).then(res => res.json()),

};