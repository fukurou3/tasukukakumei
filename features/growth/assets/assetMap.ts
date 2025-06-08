// features/growth/assets/assetMap.ts

type ThemeAssets = {
  [key: string]: any; // 画像、BGM、設定ファイルなど
};

// 全てのアセットを事前にrequireし、マップとして保持
const allThemeAssets: { [themeId: string]: ThemeAssets } = {
  SilentForest: {
    'image_1.png': require('./scene/SilentForest/image_1.png'),
    'image_2.png': require('./scene/SilentForest/image_2.png'), // image_2.pngが存在する場合
    'animation_sprite.png': require('./scene/SilentForest/animation_sprite.png'),
    'character_animation.gif': require('./scene/SilentForest/character_animation.gif'),
    'bgm_1.mp3': require('./scene/SilentForest/bgm_1.mp3'),
    'bgm_2.mp3': require('./scene/SilentForest/bgm_2.mp3'),
    'bgm_3.mp3': require('./scene/SilentForest/bgm_3.mp3'),
    'setting.json': require('./scene/SilentForest/setting.json'),
  },
  plateau: {
    'image_1.png': require('./scene/plateau/image_1.png'),
    'bgm_1.mp3': require('./scene/plateau/bgm_1.mp3'),
    'setting.json': require('./scene/plateau/setting.json'),
  },
  // 他のテーマもここに追加
};

export const getThemeAsset = (themeId: string, assetName: string) => {
  const assets = allThemeAssets[themeId];
  if (assets && assets[assetName]) {
    return assets[assetName];
  }
  console.warn(`Asset not found for theme ${themeId}: ${assetName}`);
  return null;
};

export const getThemeSetting = (themeId: string) => {
  const settings = allThemeAssets[themeId]?.['setting.json'];
  if (settings) {
    return settings;
  }
  console.warn(`Setting not found for theme ${themeId}`);
  return null;
};