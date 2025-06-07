import { useState, useEffect } from 'react';
import TasksDatabase from '@/lib/TaskDatabase';
import type { Task } from '../types';

export const useFolders = (trigger?: unknown): string[] => {
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      await TasksDatabase.initialize();
      const raw = await TasksDatabase.getAllTasks();
      const tasks: Task[] = raw.map(r => JSON.parse(r) as Task);
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
