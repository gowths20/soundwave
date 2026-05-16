import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, { headers: await getHeaders() });
    return res.json();
  },
  post: async (path: string, body?: unknown) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST', headers: await getHeaders(), body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  },
  put: async (path: string, body: unknown) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT', headers: await getHeaders(), body: JSON.stringify(body),
    });
    return res.json();
  },
  delete: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers: await getHeaders() });
    return res.json();
  },
};
