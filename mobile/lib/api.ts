import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

// Map snake_case API fields → camelCase for Track objects
function normalizeTrack(t: any) {
  if (!t || typeof t !== 'object') return t;
  return {
    id: t.id,
    userId: t.user_id ?? t.userId,
    title: t.title,
    genre: t.genre,
    bpm: t.bpm,
    durationSeconds: t.duration_seconds ?? t.durationSeconds,
    audioUrl: t.audio_url ?? t.audioUrl,
    waveformUrl: t.waveform_url ?? t.waveformUrl,
    coverUrl: t.cover_url ?? t.coverUrl,
    playCount: t.play_count ?? t.playCount ?? 0,
    status: t.status,
    uploadedAt: t.uploaded_at ?? t.uploadedAt,
  };
}

export function normalizeTracks(data: any) {
  if (Array.isArray(data)) return data.map(normalizeTrack);
  if (data && typeof data === 'object') return normalizeTrack(data);
  return data;
}

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, { headers: await getHeaders() });
    const data = await res.json();
    if (path.includes('/api/tracks')) return normalizeTracks(data);
    return data;
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
