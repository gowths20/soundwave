import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  session: { access_token: string } | null;
  setSession: (session: AuthState['session']) => void;
  setUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
