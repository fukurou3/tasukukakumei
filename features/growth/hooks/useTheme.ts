// features/growth/hooks/useTheme.ts
import { useState, useEffect } from 'react';
import type { ThemeConfig, ThemeId } from '@/features/growth/theme.config';

// テーマのアセットを動的に解決するためのヘルパー
const themeAssetResolver = (themeId: ThemeId) => {
  // 注意: Metro Bundlerはrequire内のパスを静的に解決する必要があるため、
  // require() の引数に完全な動的変数は使えません。
  // そのため、テーマごとにswitch文で分岐させます。
  switch (themeId) {
    case 'plateau':
      return {
        config: require(`@/features/growth/assets/scene/plateau/setting.json`),
      };
    case 'SilentForest':
       return {
        config: require(`@/features/growth/assets/scene/SilentForest/setting.json`),
      };
    default:
      // 未知のテーマIDに対するフォールバック
      return { config: null };
  }
};

export const useTheme = (themeId: ThemeId) => {
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const { config: themeConfig } = themeAssetResolver(themeId);
      if (themeConfig) {
        setConfig(themeConfig);
      } else {
        throw new Error(`Theme configuration for "${themeId}" not found.`);
      }
    } catch (e: any) {
      setError(e);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [themeId]);

  return { config, loading, error };
};