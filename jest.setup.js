// jest.setup.js
import 'expo-router/jestSetup';      // Expo Router を使っているなら必須

// ---- DevMenu をダミー化 ----
jest.mock('expo-dev-menu', () => ({
  registerDevMenuItems: jest.fn(),
}));

// TurboModuleRegistry が DevMenu を探してもコケないよう backup
import { NativeModules } from 'react-native';
NativeModules.DevMenu = NativeModules.DevMenu || {};
