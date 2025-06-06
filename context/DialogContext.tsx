import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmModal } from '@/features/add/components/DeadlineSettingModal/ConfirmModal';

export type DialogOptions = {
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;
  isOkDestructive?: boolean;
};

export type DialogContextType = {
  showDialog: (options: DialogOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [resolver, setResolver] = useState<((result: boolean) => void) | null>(null);

  const showDialog = (opts: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolver?.(true);
    setResolver(null);
    setOptions(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    setResolver(null);
    setOptions(null);
  };

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      {options && (
        <ConfirmModal
          visible={true}
          title={options.title}
          message={options.message}
          okText={options.okText}
          cancelText={options.cancelText}
          isOkDestructive={options.isOkDestructive}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
};
