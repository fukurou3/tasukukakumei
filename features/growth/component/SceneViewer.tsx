// features/growth/components/SceneViewer.tsx

import React, { useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import type { ThemeConfig } from '@/features/growth/theme.config';
import type { PlayerThemeState } from '@/features/growth/types';

interface SceneViewerProps {
  themeConfig: ThemeConfig;
  playerThemeState: PlayerThemeState;
}

const themeImageResolver = (themeId: string, imageName: string) => {
    switch (themeId) {
      case 'plateau':
        // 将来的に画像名によって分岐させることも可能
        return require(`@/features/growth/assets/scene/plateau/image_1.png`);
      case 'SilentForest':
        return require(`@/features/growth/assets/scene/SilentForest/image_1.png`);
      default:
        return null;
    }
  };


export const SceneViewer: React.FC<SceneViewerProps> = ({ themeConfig, playerThemeState }) => {
  const currentLevel = playerThemeState.level;

  const currentGrowthStep = useMemo(() => {
    // 現在のレベルに最も近い、またはそれ以下のレベルの成長段階を探す
    return [...themeConfig.growth]
      .reverse()
      .find(step => step.level <= currentLevel);
  }, [themeConfig.growth, currentLevel]);

  if (!currentGrowthStep) {
    return (
      <View style={styles.container}>
        <Text>成長段階が見つかりません。</Text>
      </View>
    );
  }

  const imageSource = themeImageResolver(themeConfig.themeId, currentGrowthStep.image);
  
  if (!imageSource) {
      return (
        <View style={styles.container}>
          <Text>画像が見つかりません: {currentGrowthStep.image}</Text>
        </View>
      );
  }
  
  // レスポンシブ対応のスタイル
  const source = Image.resolveAssetSource(imageSource);
  const aspectRatio = source ? source.width / source.height : 1;
  const screenWidth = Dimensions.get('window').width;
  const displayWidth = screenWidth * 0.9;
  const displayHeight = displayWidth / aspectRatio;

  return (
    <View style={[styles.container, { width: displayWidth, height: displayHeight }]}>
      <Image source={imageSource} style={styles.image} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});