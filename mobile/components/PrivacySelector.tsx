import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ContentVisibility } from '../types';

const OPTIONS: { label: string; value: ContentVisibility }[] = [
  { label: 'Everyone', value: 'everyone' },
  { label: 'Friends', value: 'friends' },
  { label: 'Close Friends', value: 'close_friends' },
  { label: 'Nobody', value: 'nobody' },
];

interface Props {
  label: string;
  value: ContentVisibility;
  onChange: (v: ContentVisibility) => void;
}

export function PrivacySelector({ label, value, onChange }: Props) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-zinc-800">
      <Text className="text-white text-sm">{label}</Text>
      <Picker selectedValue={value} onValueChange={onChange} style={{ color: '#fff', width: 160 }}>
        {OPTIONS.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
      </Picker>
    </View>
  );
}
