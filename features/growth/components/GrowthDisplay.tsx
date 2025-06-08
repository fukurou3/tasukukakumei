import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../themes/types';

interface Props {
  theme: Theme | undefined;
  progress: { totalGrowthPoints: number; currentGrowthStage: string } | undefined;
  asset: { image: any } | undefined;
  getProgressText: () => string;
}

export default function GrowthDisplay({ theme, progress, asset, getProgressText }: Props) {
  const { t } = useTranslation();
  const PLACEHOLDER_IMAGE_FALLBACK = require('@/assets/images/growth/placeholder.png');
  const currentThemeImage = asset?.image || PLACEHOLDER_IMAGE_FALLBACK;

  return (
    <View style={styles.container}>
      {currentThemeImage && <Image source={currentThemeImage} style={styles.image} resizeMode="contain" />}
      <Text style={styles.info}>{t('growth.current_theme')}: {theme?.name || t('common.none')}</Text>
      <Text style={styles.points}>{t('growth.current_points')}: {progress?.totalGrowthPoints ?? 0}</Text>
      <Text style={styles.progress}>{getProgressText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#e8e8e8' },
  image: { width: 200, height: 200, marginBottom: 20 },
  info: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  points: { fontSize: 16, color: '#555', marginBottom: 10 },
  progress: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
});
