// features/growth/theme.config.ts

// 利用可能なテーマのIDをここに列挙します
export const AVAILABLE_THEMES = ['plateau', 'SilentForest'] as const;

export type ThemeId = typeof AVAILABLE_THEMES[number];

export const INITIAL_THEME_ID: ThemeId = 'plateau';

// テーマごとの詳細な設定は、各フォルダの `setting.json` から読み込みます。
// そのJSONファイルの型を定義します。
export interface ThemeConfig {
  themeId: ThemeId;
  nameKey: string;
  growth: {
    level: number;
    image: string; // 画像ファイル名
  }[];
  bgm: string; // BGMファイル名
}