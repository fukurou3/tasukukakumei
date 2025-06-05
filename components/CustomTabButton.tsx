import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

type Props = {
  to: any;
  children: React.ReactNode;
  shouldWarn: boolean;
  onDiscard: () => void;
};

export function CustomTabButton({ to, children, shouldWarn, onDiscard }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (shouldWarn) {
      Alert.alert('変更を破棄しますか？', '保存されていない内容は失われます。', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '破棄',
          style: 'destructive',
          onPress: () => {
            onDiscard();
            router.replace(to);
          },
        },
      ]);
    } else {
      router.replace(to);
    }
  };

  return <TouchableOpacity onPress={handlePress}>{children}</TouchableOpacity>;
}
