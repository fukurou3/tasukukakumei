import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Image as SkiaImage, useImage } from '@shopify/react-native-skia';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

interface StartupAnimationProps {
  onAnimationEnd?: () => void;
}

export default function StartupAnimation({ onAnimationEnd }: StartupAnimationProps) {
  const progress = useSharedValue(0);
  const image = useImage(require('@/assets/splash-icon.png'));

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished && onAnimationEnd) {
        runOnJS(onAnimationEnd)();
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  if (!image) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.center, animatedStyle]} pointerEvents="none">
      <Canvas style={{ width: 180, height: 180 }}>
        <SkiaImage image={image} x={0} y={0} width={180} height={180} fit="contain" />
      </Canvas>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
