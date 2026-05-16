import { create } from 'zustand';
import { Audio } from 'expo-av';
import { Track } from '../types';
import { api } from '../lib/api';

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  sound: Audio.Sound | null;
  loadTrack: (track: Track) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  unload: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  sound: null,

  loadTrack: async (track) => {
    const { sound: existing } = get();
    if (existing) await existing.unloadAsync();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.audioUrl! },
      { shouldPlay: true },
      (status) => {
        if (!status.isLoaded) return;
        set({ positionMs: status.positionMillis, durationMs: status.durationMillis ?? 0, isPlaying: status.isPlaying });

        if (status.isPlaying && status.positionMillis > 0 && status.positionMillis % 10000 < 500) {
          api.post(`/api/tracks/${track.id}/play`, { secondsPlayed: Math.floor(status.positionMillis / 1000) });
        }
      }
    );

    set({ currentTrack: track, sound, isPlaying: true });
  },

  play: async () => {
    await get().sound?.playAsync();
    set({ isPlaying: true });
  },

  pause: async () => {
    await get().sound?.pauseAsync();
    set({ isPlaying: false });
  },

  seek: async (seconds) => {
    await get().sound?.setPositionAsync(seconds * 1000);
  },

  unload: async () => {
    await get().sound?.unloadAsync();
    set({ sound: null, currentTrack: null, isPlaying: false, positionMs: 0 });
  },
}));
