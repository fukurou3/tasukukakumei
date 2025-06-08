// features/growth/GrowthScreen.tsx

import React from 'react';
import { View, StyleSheet, Button, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { usePlayerData } from '@/features/growth/hooks/UsePlayerData';
import { useTheme } from '@/features/growth/hooks/useTheme';
import { AVAILABLE_THEMES } from '@/features/growth/theme.config';
import { useTranslation } from 'react-i18next';
import { SceneViewer } from './component/SceneViewer';

export default function GrowthScreen() {
  const { t } = useTranslation();
  const { isReady: isPlayerDataReady, themes, selectedThemeId, setSelectedThemeId, addExp } = usePlayerData();
  const { config: themeConfig, loading: isThemeLoading, error: themeError } = useTheme(selectedThemeId);

  const playerData = themes[selectedThemeId];

  if (!isPlayerDataReady || isThemeLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
        <ThemedText>{t('common.loading')}</ThemedText>
      </ThemedView>
    );
  }

  if (themeError || !playerData || !themeConfig) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Error loading theme.</ThemedText>
        {themeError && <Text>{themeError.message}</Text>}
      </ThemedView>
    );
  }
  
  const expPercentage = (playerData.exp / playerData.expToNextLevel) * 100;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.themeSelector}>
        {AVAILABLE_THEMES.map(id => (
            <TouchableOpacity 
              key={id} 
              onPress={() => setSelectedThemeId(id)} 
              style={[styles.themeButton, id === selectedThemeId && styles.themeButtonSelected]}
            >
                <Text style={id === selectedThemeId ? styles.themeButtonTextSelected : styles.themeButtonText}>
                  {t(themeConfig.nameKey)}
                </Text>
            </TouchableOpacity>
        ))}
      </View>
      
      <SceneViewer themeConfig={themeConfig} playerThemeState={playerData} />

      <View style={styles.statusContainer}>
        <ThemedText type="title">{t(themeConfig.nameKey)}</ThemedText>
        <ThemedText style={styles.levelText}>
          {t('growth.level', { level: playerData.level })}
        </ThemedText>
        <View style={styles.expBarContainer}>
          <View style={[styles.expBar, { width: `${expPercentage}%` }]} />
        </View>
        <ThemedText style={styles.expText}>
          {playerData.exp} / {playerData.expToNextLevel} EXP
        </ThemedText>
      </View>
      
      <Button title={t('growth.add_exp_button', { amount: 25 })} onPress={() => addExp(selectedThemeId, 25)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center'},
    container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    themeSelector: { flexDirection: 'row', gap: 10, paddingBottom: 20 },
    themeButton: { padding: 10, borderRadius: 5, backgroundColor: '#eee' },
    themeButtonSelected: { backgroundColor: '#ccc' },
    themeButtonText: { color: '#333' },
    themeButtonTextSelected: { color: '#000', fontWeight: 'bold' },
    statusContainer: { width: '100%', alignItems: 'center', gap: 10, paddingVertical: 20 },
    levelText: { fontSize: 24, fontWeight: 'bold' },
    expBarContainer: { width: '80%', height: 20, backgroundColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden' },
    expBar: { height: '100%', backgroundColor: '#4caf50', borderRadius: 10 },
    expText: { fontSize: 16 }
});