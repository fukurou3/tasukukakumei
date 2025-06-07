import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { getAllTasksFromDB, initTasksDB } from '@/lib/tasksNative';

export const useFolders = (trigger?: unknown): string[] => {
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      await initTasksDB();
      const tasks: Task[] = await getAllTasksFromDB();
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
