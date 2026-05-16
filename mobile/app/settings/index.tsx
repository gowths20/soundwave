import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const items = [
    { label: 'Privacy', route: '/settings/privacy' as const },
    { label: 'Close Friends', route: '/settings/close-friends' as const },
    { label: 'Notifications', route: '/settings/notifications' as const },
  ];

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-6">Settings</Text>
      {items.map(({ label, route }) => (
        <Pressable
          key={route}
          onPress={() => router.push(route)}
          className="bg-zinc-900 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between"
        >
          <Text className="text-white">{label}</Text>
          <Text className="text-zinc-500">›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
