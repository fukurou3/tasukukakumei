import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '@/features/tasks/types';
import { STORAGE_KEY } from '@/features/tasks/constants';

interface TasksContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType>({
  tasks: [],
  setTasks: () => {},
  loading: true,
  refresh: async () => {},
});

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setTasks(raw ? JSON.parse(raw) : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const refresh = async () => {
    setLoading(true);
    await loadTasks();
  };

  return (
    <TasksContext.Provider value={{ tasks, setTasks, loading, refresh }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => useContext(TasksContext);
