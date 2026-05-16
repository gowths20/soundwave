import { useAudioStore } from '../store/audioStore';
import { Track } from '../types';

export function useAudioPlayer() {
  const { currentTrack, isPlaying, positionMs, durationMs, loadTrack, play, pause, seek } = useAudioStore();

  const togglePlay = async (track?: Track) => {
    if (track && track.id !== currentTrack?.id) {
      await loadTrack(track);
    } else if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  return { currentTrack, isPlaying, positionMs, durationMs, togglePlay, seek };
}
