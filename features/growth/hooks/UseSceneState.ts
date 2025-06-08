import React, { createContext, useContext, useState, ReactNode } from 'react';

type SceneContextValue = {
  selectedScene: string;
  setSelectedScene: (id: string) => void;
};

const SceneContext = createContext<SceneContextValue | undefined>(undefined);

export const SceneProvider = ({ children }: { children: ReactNode }) => {
  const [selectedScene, setSelectedScene] = useState<string>('Silent Forest');

  return (
    <SceneContext.Provider value={{ selectedScene, setSelectedScene }}>
      {children}
    </SceneContext.Provider>
  );
};

export const useSceneState = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useSceneState must be used within a SceneProvider');
  }
  return context;
};

