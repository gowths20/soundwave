import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: '#000' }, tabBarActiveTintColor: '#FF5500', headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color} /> }} />
      <Tabs.Screen name="upload" options={{ title: 'Upload', tabBarIcon: ({ color }) => <Ionicons name="cloud-upload" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} /> }} />
    </Tabs>
  );
}
