// app/features/tasks/types.ts
import { DeadlineSettings } from '@/features/add/components/DeadlineSettingModal/types';
import type dayjs from 'dayjs';
// DeadlineSettings をインポートし、同時に再エクスポートします
export type { DeadlineSettings } from '@/features/add/components/DeadlineSettingModal/types';

export type Task = {
  id: string;
  title: string;
  memo?: string;
  deadline?: string;
  folder?: string;
  completedAt?: string;
  customOrder?: number;
  priority?: number;
  deadlineDetails?: DeadlineSettings;
  completedInstanceDates?: string[];
  imageUris?: string[];
};

export type FolderOrder = string[];

export type FolderDeleteMode = 'delete_all' | 'only_folder';

export type SelectableItem = {
  type: 'task' | 'folder';
  id: string;
};

export type DisplayTaskOriginal = Task & {
  displaySortDate: dayjs.Dayjs | null;
  isTaskFullyCompleted: boolean;
};

export type DisplayableTaskItem = DisplayTaskOriginal & {
  keyId: string;
  isCompletedInstance?: boolean;
  instanceDate?: string;
};