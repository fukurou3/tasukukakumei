// features/growth/GrowthScreen.tsx
import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { usePlayerData } from '@/features/growth/hooks/UsePlayerData';
import SceneViewer from '@/features/growth/component/SceneViewer';
import FocusTimer from '@/features/growth/component/FocusTimer';

export default function GrowthScreen() {
  const { isReady, gold, growth, addGold, addGrowth } = usePlayerData();

  if (!isReady) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">成長の世界</ThemedText>

      <SceneViewer growth={growth} />

      <View style={styles.statusContainer}>
        <ThemedText style={styles.goldText}>所持ゴールド: {gold} G</ThemedText>
        <ThemedText style={styles.goldText}>成長ポイント: {growth}</ThemedText>
      </View>

      <FocusTimer onComplete={() => addGrowth(1)} />

      <Button title="ゴールドを10増やす" onPress={() => addGold(10)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  statusContainer: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    gap: 4,
  },
  goldText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
