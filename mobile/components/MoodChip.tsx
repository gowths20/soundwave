import React from 'react';
import { View, Text } from 'react-native';
import { MoodType } from '../types';

const MOOD_CONFIG: Record<MoodType, { emoji: string; bg: string }> = {
  hype:       { emoji: '🔥', bg: 'bg-orange-500' },
  chill:      { emoji: '😌', bg: 'bg-blue-400' },
  focus:      { emoji: '🎯', bg: 'bg-green-500' },
  romantic:   { emoji: '💜', bg: 'bg-purple-500' },
  melancholy: { emoji: '🌧️', bg: 'bg-gray-500' },
  party:      { emoji: '🎉', bg: 'bg-pink-500' },
};

export function MoodChip({ mood }: { mood: string }) {
  const config = MOOD_CONFIG[mood as MoodType] ?? { emoji: '🎵', bg: 'bg-gray-600' };
  return (
    <View className={`${config.bg} rounded-full px-2 py-1 flex-row items-center gap-1`}>
      <Text style={{ fontSize: 10 }}>{config.emoji}</Text>
      <Text className="text-white text-xs font-medium capitalize">{mood}</Text>
    </View>
  );
}
