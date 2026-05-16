import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-2">{user?.displayName ?? 'Your Profile'}</Text>
      <Text className="text-zinc-500 mb-6">@{user?.username}</Text>
      <Pressable onPress={signOut} className="mt-8 bg-zinc-900 rounded-xl py-4 items-center">
        <Text className="text-red-500 font-semibold">Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}
