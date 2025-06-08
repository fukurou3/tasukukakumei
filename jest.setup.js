// jest.setup.js
// Expo Router のテスト用セットアップが存在しない環境のため読み込みをスキップ

// ---- DevMenu をダミー化 ----
jest.mock('expo-dev-menu', () => ({
  registerDevMenuItems: jest.fn(),
}), { virtual: true });

// TurboModuleRegistry が DevMenu を探してもコケないよう backup
import { NativeModules } from 'react-native';
NativeModules.DevMenu = NativeModules.DevMenu || {};

// expo-localization のネイティブモジュールをモック
jest.mock('expo-localization', () => ({
  locale: 'en-US',
  timeZone: 'UTC',
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
}));
jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn(),
  BackgroundFetchResult: { NoData: 1 },
}));
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({ isConnected: true }),
}));

jest.mock('expo-background-timer', () => ({
  bgSetInterval: jest.fn(() => 1),
  bgClearInterval: jest.fn(),
  enableBackgroundExecution: jest.fn(),
  disableBackgroundExecution: jest.fn(),
}));

jest.mock('@shopify/react-native-skia', () => ({
  Canvas: () => null,
  Image: () => null,
  useImage: jest.fn(),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));
