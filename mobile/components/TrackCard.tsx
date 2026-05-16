import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Track } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export function TrackCard({ track }: { track: Track }) {
  const { currentTrack, isPlaying, togglePlay } = useAudioPlayer();
  const isActive = currentTrack?.id === track.id;

  return (
    <Pressable onPress={() => togglePlay(track)} className="flex-row items-center gap-3 py-3">
      <Image
        source={{ uri: track.coverUrl ?? 'https://via.placeholder.com/48' }}
        className="w-12 h-12 rounded-xl"
      />
      <View className="flex-1">
        <Text className={`font-semibold text-sm ${isActive ? 'text-orange-500' : 'text-white'}`}>
          {track.title}
        </Text>
        {track.genre && <Text className="text-zinc-500 text-xs">{track.genre}</Text>}
      </View>
      <Text className="text-zinc-500 text-xs">
        {isActive && isPlaying ? '▶' : '⏸'}
      </Text>
    </Pressable>
  );
}
