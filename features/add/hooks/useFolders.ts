import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types';
import { STORAGE_KEY } from '../constants';

export const useFolders = (trigger?: unknown): string[] => {
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      // JSON.parse の結果を Task[] として扱う
      const tasks: Task[] = raw ? (JSON.parse(raw) as Task[]) : [];
      const unique = Array.from(
        new Set(
          tasks
            .map(t => t.folder)
            .filter((f): f is string => !!f)
        )
      );
      setFolders(unique);
    };
    load();
  }, [trigger]);

  return folders;
};
