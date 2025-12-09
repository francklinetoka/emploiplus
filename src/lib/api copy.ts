// src/lib/api.ts
const API = "/api"; // Vite proxy → http://localhost:5000

export const api = {
  loginAdmin: async (email: string, password: string) => {
    const res = await fetch(`${API}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await res.json(); // { success: true, admin: { ... } } ou { success: false }
  },

  getJobs: async () => (await fetch(`${API}/jobs`)).json(),
  getFormations: async () => (await fetch(`${API}/formations`)).json(),
};