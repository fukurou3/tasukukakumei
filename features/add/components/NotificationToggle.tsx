// app/(tabs)/add/_components/_NotificationToggle.tsx

import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { AddTaskStyles } from '../types';

/** NotificationToggle に渡す props の型定義 */
export interface NotificationToggleProps {
  /** 通知オン／オフの状態 */
  notifyEnabled: boolean;
  /** トグルボタンが押されたときのハンドラ */
  onToggle: () => void;
  /** ダークモードかどうか */
  isDark: boolean;
  /** サブカラー（オン時の背景色） */
  subColor: string;
  /** AddTaskScreen 側で作成したスタイルオブジェクト */
  styles: AddTaskStyles;
}

/**
 * 通知のオン／オフを切り替えるトグルスイッチコンポーネント
 */
export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  notifyEnabled,
  onToggle,
  isDark,
  subColor,
  styles,
}) => {
  return (
    <TouchableOpacity onPress={onToggle}>
      <View
        style={[
          styles.toggleContainer,
          {
            flexDirection: 'row',
            justifyContent: notifyEnabled ? 'flex-end' : 'flex-start',
            backgroundColor: notifyEnabled
              ? subColor
              : isDark
                ? '#555'
                : '#ccc',
          },
        ]}
      >
        <View style={styles.toggleCircle} />
      </View>
    </TouchableOpacity>
  );
};
