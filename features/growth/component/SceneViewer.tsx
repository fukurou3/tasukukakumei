import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSceneState } from '../hooks/UseSceneState';

const scenes = [
  {
    id: 'Silent Forest',
    name: '静かな森',
    image: require('../assets/scene/Silent Forest/画像.png'),
  },
  {
    id: 'plateau',
    name: '高原',
    image: require('../assets/scene/plateau/画像.png'),
  },
];

type Props = {
  growth: number;
};

const SceneViewer: React.FC<Props> = ({ growth }) => {
  const { sceneId, setSceneId } = useSceneState();
  const scene = scenes.find((s) => s.id === sceneId) ?? scenes[0];

  return (
    <View style={styles.container}>
      <Picker selectedValue={sceneId} onValueChange={(v) => setSceneId(String(v))}>
        {scenes.map((s) => (
          <Picker.Item label={s.name} value={s.id} key={s.id} />
        ))}
      </Picker>
      <Image
        source={scene.image}
        style={[styles.image, { transform: [{ scale: 1 + growth * 0.05 }] }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 200,
  },
});

export default SceneViewer;
