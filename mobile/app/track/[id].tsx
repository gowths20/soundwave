import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { Track } from '../../types';
import { WaveformPlayer } from '../../components/WaveformPlayer';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

export default function TrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const { currentTrack, isPlaying, togglePlay } = useAudioPlayer();
  const isActive = currentTrack?.id === id;

  useEffect(() => {
    api.get(`/api/tracks/${id}`).then(setTrack);
  }, [id]);

  if (!track) return <View className="flex-1 bg-black items-center justify-center"><ActivityIndicator color="#FF5500" /></View>;

  return (
    <View className="flex-1 bg-black px-6 pt-20">
      <Image source={{ uri: track.coverUrl ?? 'https://via.placeholder.com/300' }} className="w-full aspect-square rounded-3xl mb-6" />
      <Text className="text-white text-2xl font-black mb-1">{track.title}</Text>
      {track.genre && <Text className="text-zinc-500 mb-6">{track.genre}</Text>}

      <WaveformPlayer />

      <Pressable onPress={() => togglePlay(track)} className="mt-6 bg-orange-500 rounded-full w-16 h-16 items-center justify-center self-center">
        <Text className="text-white text-2xl">{isActive && isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>
    </View>
  );
}
