import { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isArtist, setIsArtist] = useState(false);
  const [loading, setLoading] = useState(false);

  const next = async () => {
    setLoading(true);
    await api.post('/api/profile', { displayName, username, bio, isArtist });
    setLoading(false);
    router.push('/(auth)/privacy-setup');
  };

  return (
    <View className="flex-1 bg-black px-6 pt-20">
      <Text className="text-zinc-400 text-sm mb-1">Step 3 of 4</Text>
      <Text className="text-white text-3xl font-black mb-8">Your profile</Text>

      <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#666"
        className="bg-zinc-900 text-white rounded-xl px-4 py-4 mb-3" />
      <TextInput value={username} onChangeText={setUsername} placeholder="Username (no spaces)" placeholderTextColor="#666" autoCapitalize="none"
        className="bg-zinc-900 text-white rounded-xl px-4 py-4 mb-3" />
      <TextInput value={bio} onChangeText={setBio} placeholder="Bio (optional)" placeholderTextColor="#666" multiline
        className="bg-zinc-900 text-white rounded-xl px-4 py-4 mb-6" />

      <View className="flex-row items-center justify-between mb-8 bg-zinc-900 rounded-xl px-4 py-4">
        <Text className="text-white">I'm an artist — I upload music</Text>
        <Switch value={isArtist} onValueChange={setIsArtist} trackColor={{ true: '#FF5500' }} />
      </View>

      <Pressable onPress={next} disabled={loading} className="bg-orange-500 rounded-xl py-4 items-center">
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Next</Text>}
      </Pressable>
    </View>
  );
}
