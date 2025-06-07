// features/growth/hooks/Useplayerdata.ts
import { useState, useEffect, useCallback } from 'react';
import { initializeDatabase, getCurrency, updateCurrency } from '@/features/growth/data/playerdatabase';

export const useUseplayerdata = () => {
  const [isReady, setIsReady] = useState(false);
  const [gold, setGold] = useState(0);

  useEffect(() => {
    const setup = async () => {
      await initializeDatabase();
      const initialGold = await getCurrency('gold');
      setGold(initialGold);
      setIsReady(true);
    };
    setup();
  }, []);
  
  const addGold = useCallback(async (amount: number) => {
    const newGold = gold + amount;
    await updateCurrency('gold', newGold);
    setGold(newGold);
  }, [gold]);

  return { isReady, gold, addGold };
};