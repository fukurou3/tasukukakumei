// features/growth/themes/types.ts

export type GrowthStage = 'seed' | 'sprout' | 'young' | 'mature' | 'ancient'; // 成長段階

export interface ThemeAsset {
  image: any; // 画像リソース (require('./assets/images/theme1/stage1.png')など)
  bgm?: any; // BGMリソース (require('./assets/audio/theme1_bgm.mp3')など)
  // 将来的にアニメーションデータなどもここに追加
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  locked: boolean; // ストア/ガチャでアンロックされるか
  growthStages: {
    [key in GrowthStage]: ThemeAsset;
  };
  // 必要に応じて、テーマごとのBGM、効果音、特殊能力などもここに追加
}

export interface UserThemeProgress {
  themeId: string;
  totalGrowthPoints: number;
  currentGrowthStage: GrowthStage;
}