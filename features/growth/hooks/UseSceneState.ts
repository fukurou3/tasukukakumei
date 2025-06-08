import { useState } from 'react';
import type { Scene } from '@/features/growth/types';

const scenes: Scene[] = [
  {
    id: 'forest',
    name: '育つ森',
    description: '静かな森が成長します',
    imagePath: require('../assets/scene/Silent Forest/画像.png'),
    bgmPath: require('../assets/scene/Silent Forest/BGM.mp3'),
  },
  {
    id: 'plateau',
    name: '高原',
    description: '広がる高原の風景',
    imagePath: require('../assets/scene/plateau/画像.png'),
    bgmPath: require('../assets/scene/plateau/BGM.mp3'),
  },
];

export const useSceneState = () => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0].id);

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) ?? scenes[0];

  return {
    scenes,
    selectedSceneId,
    setSelectedSceneId,
    selectedScene,
  };
};

export type { Scene } from '@/features/growth/types';
