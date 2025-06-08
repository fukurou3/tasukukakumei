// features/growth/themes/index.ts

import { Theme, GrowthStage, UserThemeProgress } from './types'; // Theme, GrowthStage, UserThemeProgressをtypes.tsからインポート

// ダミー画像として使用するプレースホルダー画像
// 画像アセットはプロジェクト直下の assets 配下に置かれている
// import 時には `@` エイリアスを使ってルートから参照する
const PLACEHOLDER_IMAGE = require('@/assets/images/growth/placeholder.png');

export const THEMES: Theme[] = [
  {
    id: 'forest_spirit',
    name: '森の精霊',
    description: '森の穏やかな精霊が宿るテーマです。',
    locked: false,
    actionTabBackground: 'black',
    growthStages: {
      seed: { image: PLACEHOLDER_IMAGE },
      sprout: { image: PLACEHOLDER_IMAGE },
      young: { image: PLACEHOLDER_IMAGE },
      mature: { image: PLACEHOLDER_IMAGE },
      ancient: { image: PLACEHOLDER_IMAGE },
    },
  },
  {
    id: 'ocean_guardian',
    name: '海の守護者',
    description: '深海の力が宿るテーマです。',
    locked: true,
    actionTabBackground: 'black',
    growthStages: {
      seed: { image: PLACEHOLDER_IMAGE },
      sprout: { image: PLACEHOLDER_IMAGE },
      young: { image: PLACEHOLDER_IMAGE },
      mature: { image: PLACEHOLDER_IMAGE },
      ancient: { image: PLACEHOLDER_IMAGE },
    },
  },
  {
    id: 'default_theme',
    name: 'デフォルトテーマ',
    description: '画像がまだ設定されていないテーマです。',
    locked: false,
    actionTabBackground: 'white',
    growthStages: {
      seed: { image: PLACEHOLDER_IMAGE },
      sprout: { image: PLACEHOLDER_IMAGE },
      young: { image: PLACEHOLDER_IMAGE },
      mature: { image: PLACEHOLDER_IMAGE },
      ancient: { image: PLACEHOLDER_IMAGE },
    },
  },
  // さらにテーマを追加
];

export const GROWTH_THRESHOLDS: { [key in GrowthStage]: number } = {
  seed: 0,
  sprout: 100,
  young: 500,
  mature: 2000,
  ancient: 5000,
};

export const GROWTH_POINTS_PER_TASK_COMPLETION = 50;
export const GROWTH_POINTS_PER_FOCUS_MINUTE = 1;

export function getGrowthStage(points: number): GrowthStage {
  if (points >= GROWTH_THRESHOLDS.ancient) return 'ancient';
  if (points >= GROWTH_THRESHOLDS.mature) return 'mature';
  if (points >= GROWTH_THRESHOLDS.young) return 'young';
  if (points >= GROWTH_THRESHOLDS.sprout) return 'sprout';
  return 'seed';
}