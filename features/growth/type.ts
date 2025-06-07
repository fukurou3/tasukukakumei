// features/growth/型定義.ts

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