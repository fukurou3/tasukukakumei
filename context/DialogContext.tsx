import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmModal } from '@/features/add/components/DeadlineSettingModal/ConfirmModal';

export type DialogOptions = {
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;
  neutralText?: string;
  isOkDestructive?: boolean;
  isNeutralDestructive?: boolean;
};

export type DialogResult = 'ok' | 'cancel' | 'neutral';

export type DialogContextType = {
  showDialog: (options: DialogOptions) => Promise<DialogResult>;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [resolver, setResolver] = useState<((result: DialogResult) => void) | null>(null);

  const showDialog = (opts: DialogOptions) => {
    return new Promise<DialogResult>((resolve) => {
      setOptions(opts);
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolver?.('ok');
    setResolver(null);
    setOptions(null);
  };

  const handleCancel = () => {
    resolver?.('cancel');
    setResolver(null);
    setOptions(null);
  };

  const handleNeutral = () => {
    resolver?.('neutral');
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
          neutralText={options.neutralText}
          isOkDestructive={options.isOkDestructive}
          isNeutralDestructive={options.isNeutralDestructive}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onNeutral={handleNeutral}
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
