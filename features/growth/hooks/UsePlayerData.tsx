// features/growth/hooks/UsePlayerData.tsx

import { useState, useEffect, useCallback } from 'react';
import { initializeDatabase, getCurrency, updateCurrency, getAllThemes, updateTheme } from '@/features/growth/data/playerDatabase';
import type { PlayerThemeState } from '@/features/growth/types';
import { INITIAL_THEME_ID, type ThemeId } from '@/features/growth/theme.config';

export const usePlayerData = () => {
  const [isReady, setIsReady] = useState(false);
  const [gold, setGold] = useState(0);
  const [themes, setThemes] = useState<Record<string, PlayerThemeState>>({});
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(INITIAL_THEME_ID);

  const loadInitialData = useCallback(async () => {
    try {
      await initializeDatabase();
      const [initialGold, initialThemes] = await Promise.all([
        getCurrency('gold'),
        getAllThemes(),
      ]);
      setGold(initialGold);
      const themesMap = initialThemes.reduce((acc, theme) => {
        acc[theme.id] = theme;
        return acc;
      }, {} as Record<string, PlayerThemeState>);
      setThemes(themesMap);
    } catch (e) {
      console.error("Database setup failed", e);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const addGold = useCallback(async (amount: number) => {
    const newGold = gold + amount;
    await updateCurrency('gold', newGold);
    setGold(newGold);
  }, [gold]);

  const addExp = useCallback(async (themeId: string, amount: number) => {
    const targetTheme = themes[themeId];
    if (!targetTheme) return;

    let newExp = targetTheme.exp + amount;
    let newLevel = targetTheme.level;
    let newExpToNextLevel = targetTheme.expToNextLevel;

    while (newExp >= newExpToNextLevel) {
      newExp -= newExpToNextLevel;
      newLevel += 1;
      newExpToNextLevel = Math.floor(newExpToNextLevel * 1.5);
    }

    const updatedTheme: PlayerThemeState = { ...targetTheme, level: newLevel, exp: newExp, expToNextLevel: newExpToNextLevel };
    await updateTheme(updatedTheme);
    setThemes(prevThemes => ({ ...prevThemes, [themeId]: updatedTheme }));

  }, [themes]);

  return { 
    isReady, 
    gold, 
    themes, 
    selectedThemeId, 
    setSelectedThemeId,
    addGold, 
    addExp, 
    refreshData: loadInitialData 
  };
};