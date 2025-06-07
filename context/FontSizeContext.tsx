// app/context/FontSizeContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getItem, setItem } from '@/lib/Storage';

export type FontSizeKey = 'small' | 'normal' | 'medium' | 'large';

type FontSizeContextType = {
  fontSizeKey: FontSizeKey;
  setFontSizeKey: (key: FontSizeKey) => void;
};

export const FontSizeContext = createContext<FontSizeContextType>({
  fontSizeKey: 'normal',
  setFontSizeKey: () => {},
});

const STORAGE_KEY = 'FONT_SIZE_KEY';

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSizeKey, setFontSizeKeyState] = useState<FontSizeKey>('normal');

  useEffect(() => {
    (async () => {
      const raw = await getItem(STORAGE_KEY);
      if (
        raw === 'small' ||
        raw === 'normal' ||
        raw === 'medium' ||
        raw === 'large'
      ) {
        setFontSizeKeyState(raw);
      }
    })();
  }, []);

  const setFontSizeKey = async (key: FontSizeKey) => {
    await setItem(STORAGE_KEY, key);
    setFontSizeKeyState(key);
  };

  return (
    <FontSizeContext.Provider value={{ fontSizeKey, setFontSizeKey }}>
      {children}
    </FontSizeContext.Provider>
  );
};
