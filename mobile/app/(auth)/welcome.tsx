import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-black items-center justify-center px-8">
      <Text className="text-orange-500 text-5xl font-black mb-2">🎵</Text>
      <Text className="text-white text-4xl font-black mb-2">Soundwave</Text>
      <Text className="text-zinc-400 text-center mb-16">Discover music through your social circle.</Text>

      <Pressable onPress={() => router.push('/(auth)/signup')} className="w-full bg-orange-500 rounded-2xl py-4 items-center mb-4">
        <Text className="text-white font-bold text-base">Get Started</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/login')} className="w-full bg-zinc-900 rounded-2xl py-4 items-center">
        <Text className="text-white font-semibold text-base">Log In</Text>
      </Pressable>
    </View>
  );
}
