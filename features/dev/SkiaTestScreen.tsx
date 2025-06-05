// features/dev/SkiaTestScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

export default function SkiaTestScreen() {
  // 円の半径
  const radius = 50;

  // 円の中心座標を管理する特別な変数 (Reanimated)
  const cx = useSharedValue(150);
  const cy = useSharedValue(150);

  // 指の動き（ドラッグ）を検出するジェスチャーを定義 (Gesture Handler)
  const gesture = Gesture.Pan().onUpdate((event) => {
    // 指の動きに合わせて、円の中心座標を更新する
    cx.value = event.x;
    cy.value = event.y;
  });

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Canvas style={styles.canvas}>
          <Circle cx={cx} cy={cy} r={radius} color="#61dafb" />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // 暗めの背景色
  },
  canvas: {
    flex: 1,
  },
});