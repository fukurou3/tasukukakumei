// features/growth/GrowthScreen.tsx
import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { usePlayerData } from '@/features/growth/hooks/usePlayerData';
import FocusTimer from '@/features/growth/component/FocusTimer';
import SceneViewer from '@/features/growth/component/SceneViewer';
import { SceneProvider, useSceneState } from '@/features/growth/hooks/useSceneState';

export default function GrowthScreen() {
  const { isReady, gold, growthPoints, addGold, addGrowth } = usePlayerData();

  if (!isReady) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SceneProvider>
      <ThemedView style={styles.container}>
        <ThemedText type="title">成長の世界</ThemedText>
        <SceneSelector />
        <View style={styles.statusContainer}>
          <ThemedText style={styles.goldText}>所持ゴールド: {gold} G</ThemedText>
          <ThemedText style={styles.goldText}>成長ポイント: {growthPoints}</ThemedText>
        </View>
        <FocusTimer onFinish={() => addGrowth(1)} />
        <SceneViewer />
        <Button title="ゴールドを10増やす" onPress={() => addGold(10)} />
      </ThemedView>
    </SceneProvider>
  );
}

function SceneSelector() {
  const { selectedScene, setSelectedScene } = useSceneState();
  return (
    <Picker
      selectedValue={selectedScene}
      onValueChange={(itemValue) => setSelectedScene(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="Silent Forest" value="Silent Forest" />
      <Picker.Item label="Plateau" value="plateau" />
    </Picker>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  picker: {
    width: 200,
  },
  statusContainer: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  goldText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

