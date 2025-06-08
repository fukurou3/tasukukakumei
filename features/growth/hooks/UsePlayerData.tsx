// features/growth/hooks/usePlayerData.ts
import { useState, useEffect, useCallback } from 'react';
import { initializeDatabase, getCurrency, updateCurrency } from '@/features/growth/data/playerDatabase';

export const usePlayerData = () => {
  const [isReady, setIsReady] = useState(false);
  const [gold, setGold] = useState(0);
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    const setup = async () => {
      try {
        await initializeDatabase();
        const initialGold = await getCurrency('gold');
        const initialGrowth = await getCurrency('growth');
        setGold(initialGold);
        setGrowth(initialGrowth);
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

  const addGrowth = useCallback(async (amount: number) => {
    const newGrowth = growth + amount;
    await updateCurrency('growth', newGrowth);
    setGrowth(newGrowth);
  }, [growth]);

  return { isReady, gold, growth, addGold, addGrowth };
};
