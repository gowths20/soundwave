import React from 'react';
import { View, Pressable } from 'react-native';
import { useAudioStore } from '../store/audioStore';

export function WaveformPlayer() {
  const { positionMs, durationMs, seek } = useAudioStore();
  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <View className="w-full h-12 bg-zinc-800 rounded-xl overflow-hidden">
      <Pressable
        onPress={() => {
          seek((positionMs / 1000) + 10);
        }}
        className="flex-1"
      >
        <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: '#FF5500', opacity: 0.8 }} />
      </Pressable>
    </View>
  );
}
