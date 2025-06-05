// /app/(tabs)/SelectionContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, SelectableItem } from '@/features/tasks/types';

type SelectionContextType = {
  isSelecting: boolean;
  selectedItems: SelectableItem[];
  startSelecting: () => void;
  stopSelecting: () => void;
  toggleItem: (item: SelectableItem) => void;
  setAllItems: (items: SelectableItem[]) => void;
  clearSelection: () => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedItems, setSelectedItems] = useState<SelectableItem[]>([]);

  const isSelecting = selectedItems.length > 0;

  const startSelecting = () => {
    if (selectedItems.length === 0) {
      setSelectedItems([]);
    }
  };

  const stopSelecting = () => {
    setSelectedItems([]);
  };

  const toggleItem = (item: SelectableItem) => {
    setSelectedItems(prev => {
      const exists = prev.some(it => it.id === item.id && it.type === item.type);
      if (exists) {
        return prev.filter(it => !(it.id === item.id && it.type === item.type));
      } else {
        return [...prev, item];
      }
    });
  };

  const setAllItems = (items: SelectableItem[]) => {
    setSelectedItems(items);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return (
    <SelectionContext.Provider
      value={{
        isSelecting,
        selectedItems,
        startSelecting,
        stopSelecting,
        toggleItem,
        setAllItems,
        clearSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
