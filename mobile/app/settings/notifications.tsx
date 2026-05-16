import { View, Text, Switch } from 'react-native';
import { useState } from 'react';

export default function NotificationsScreen() {
  const [newFollower, setNewFollower] = useState(true);
  const [friendListening, setFriendListening] = useState(true);
  const [newComment, setNewComment] = useState(true);

  const Row = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-zinc-900">
      <Text className="text-white">{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#FF5500' }} />
    </View>
  );

  return (
    <View className="flex-1 bg-black px-4 pt-16">
      <Text className="text-white text-2xl font-bold mb-6">Notifications</Text>
      <Row label="New follower" value={newFollower} onChange={setNewFollower} />
      <Row label="Friend is listening" value={friendListening} onChange={setFriendListening} />
      <Row label="New comment on track" value={newComment} onChange={setNewComment} />
    </View>
  );
}
