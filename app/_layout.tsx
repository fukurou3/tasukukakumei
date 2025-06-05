// app/_layout.tsx
import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import '@/lib/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider, useAppTheme } from '@/hooks/ThemeContext';
import { FontSizeProvider } from '@/context/FontSizeContext';
import { GoogleCalendarProvider } from '@/context/GoogleCalendarContext';
import Toast from 'react-native-toast-message';

import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

function InnerLayout() {
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const rootBackgroundColor = isDark ? '#000000' : '#ffffff';

  useEffect(() => {
    if (Platform.OS === 'android') {
      const navigationBarColor = isDark ? '#121212' : '#f2f2f2';
      NavigationBar.setBackgroundColorAsync(navigationBarColor);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    }
  }, [isDark]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBackgroundColor }}>
      <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor="transparent"
          translucent
        />
        <Toast />
      </NavThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <FontSizeProvider>
        <GoogleCalendarProvider>
          <InnerLayout />
        </GoogleCalendarProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}