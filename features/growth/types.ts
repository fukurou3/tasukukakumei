// features\growth\types.ts

export interface Scene {
  id: string;
  name: string;
  description: string;
  imagePath: any;
  bgmPath: any;
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