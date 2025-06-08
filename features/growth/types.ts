// features/growth/types.ts

import { ThemeId } from '@/features/growth/theme.config';

export interface Scene {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  bgmPath: string;
}

export interface Award {
  id: string;
  name: string;
  description: string;
  isSecret: boolean;
}

export interface PlayerItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

// プレイヤーのテーマごとの進行状況
export interface PlayerThemeState {
  id: ThemeId;
  level: number;
  exp: number;
  expToNextLevel: number;
}