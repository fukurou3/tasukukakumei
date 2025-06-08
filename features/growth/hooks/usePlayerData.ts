// features/growth/hooks/usePlayerData.ts
import { useState, useEffect, useCallback } from 'react';
import {
  initializeDatabase,
  getCurrency,
  updateCurrency,
  getGrowthPoints,
  updateGrowthPoints,
} from '@/features/growth/data/playerDatabase';

export const usePlayerData = () => {
  const [isReady, setIsReady] = useState(false);
  const [gold, setGold] = useState(0);
  const [growthPoints, setGrowthPoints] = useState(0);

  useEffect(() => {
    const setup = async () => {
      try {
        await initializeDatabase();
        const initialGold = await getCurrency('gold');
        const initialGrowth = await getGrowthPoints();
        setGold(initialGold);
        setGrowthPoints(initialGrowth);
      } catch (e) {
        console.error('Database setup failed', e);
      } finally {
        setIsReady(true);
      }
    };
    setup();
  }, []);

  const addGold = useCallback(async (amount: number) => {
    const newGold = gold + amount;
    await updateCurrency('gold', newGold);
    setGold(newGold);
  }, [gold]);

  const addGrowthPoints = useCallback(
    async (amount: number) => {
      const newPoints = growthPoints + amount;
      await updateGrowthPoints(newPoints);
      setGrowthPoints(newPoints);
    },
    [growthPoints],
  );

  return { isReady, gold, addGold, growthPoints, addGrowthPoints };
};