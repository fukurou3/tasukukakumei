import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useDialog } from '@/context/DialogContext';
import { useRouter } from 'expo-router';

type Props = {
  to: any;
  children: React.ReactNode;
  shouldWarn: boolean;
  onDiscard: () => void;
};

export function CustomTabButton({ to, children, shouldWarn, onDiscard }: Props) {
  const router = useRouter();
  const { showDialog } = useDialog();

  const handlePress = async () => {
    if (shouldWarn) {
      const confirmed = await showDialog({
        title: '変更を破棄しますか？',
        message: '保存されていない内容は失われます。',
        okText: '破棄',
        cancelText: 'キャンセル',
        isOkDestructive: true,
      });
      if (confirmed) {
        onDiscard();
        router.replace(to);
      }
    } else {
      router.replace(to);
    }
  };

  return <TouchableOpacity onPress={handlePress}>{children}</TouchableOpacity>;
}
