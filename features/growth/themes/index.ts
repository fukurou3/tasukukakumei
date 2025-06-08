// features/growth/themes/index.ts

import { Theme, GrowthStage, UserThemeProgress } from './types'; // Theme, GrowthStage, UserThemeProgressをtypes.tsからインポート

// ダミー画像として使用するプレースホルダー画像
const PLACEHOLDER_IMAGE = require('../../../assets/images/growth/placeholder.png'); // 仮のパス

export const THEMES: Theme[] = [
  {
    id: 'forest_spirit',
    name: '森の精霊',
    description: '森の穏やかな精霊が宿るテーマです。',
    locked: false,
    growthStages: {
      seed: { image: require('../../../assets/images/growth/forest_spirit/seed.png') },
      sprout: { image: require('../../../assets/images/growth/forest_spirit/sprout.png') },
      young: { image: require('../../../assets/images/growth/forest_spirit/young.png') },
      mature: { image: require('../../../assets/images/growth/forest_spirit/mature.png') },
      ancient: { image: require('../../../assets/images/growth/forest_spirit/ancient.png') },
    },
  },
  {
    id: 'ocean_guardian',
    name: '海の守護者',
    description: '深海の力が宿るテーマです。',
    locked: true,
    growthStages: {
      seed: { image: require('../../../assets/images/growth/ocean_guardian/seed.png') },
      sprout: { image: require('../../../assets/images/growth/ocean_guardian/sprout.png') },
      young: { image: require('../../../assets/images/growth/ocean_guardian/young.png') },
      mature: { image: require('../../../assets/images/growth/ocean_guardian/mature.png') },
      ancient: { image: require('../../../assets/images/growth/ocean_guardian/ancient.png') },
    },
  },
  {
    id: 'default_theme',
    name: 'デフォルトテーマ',
    description: '画像がまだ設定されていないテーマです。',
    locked: false,
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