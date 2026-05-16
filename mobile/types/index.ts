export type ContentVisibility = 'everyone' | 'friends' | 'close_friends' | 'nobody';

export interface Track {
  id: string;
  userId: string;
  title: string;
  genre?: string;
  bpm?: number;
  durationSeconds?: number;
  audioUrl?: string;
  waveformUrl?: string;
  coverUrl?: string;
  playCount: number;
  status: 'processing' | 'ready' | 'failed';
  uploadedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isArtist: boolean;
}

export interface UserPrivacy {
  nowPlayingVisibility: ContentVisibility;
  likedSongsVisibility: ContentVisibility;
  historyVisibility: ContentVisibility;
  moodVisibility: ContentVisibility;
  activityVisibility: ContentVisibility;
}

export interface FeedItem {
  user: { id: string; displayName: string; avatarUrl?: string };
  nowPlaying: { trackId: string; title: string; coverUrl?: string };
  mood?: string;
}

export type MoodType = 'hype' | 'chill' | 'focus' | 'romantic' | 'melancholy' | 'party';
