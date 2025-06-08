import { create } from 'zustand';

export type SceneId = 'Silent Forest' | 'plateau';

type SceneStore = {
  sceneId: SceneId;
  setSceneId: (id: SceneId) => void;
};

export const useSceneState = create<SceneStore>((set) => ({
  sceneId: 'Silent Forest',
  setSceneId: (id) => set({ sceneId: id }),
}));
