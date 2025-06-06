// features/settings/SettingsScreen.tsx
import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme, ThemeChoice } from '@/hooks/ThemeContext';
import { useRouter, useFocusEffect } from 'expo-router'; // ← インポートされます
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import Slider from '@react-native-community/slider'; // ← インポートされます
import { FontSizeContext, FontSizeKey } from '@/context/FontSizeContext';
import { fontSizes } from '@/constants/fontSizes';
import { Ionicons } from '@expo/vector-icons';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth'; // ★ 認証フックをインポート
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKGROUND_IMAGES } from '@/constants/CalendarBackgrounds';

const CALENDAR_BG_KEY = '@calendar_background_id';

export default function SettingsScreen() {
  const {
    themeChoice,
    setThemeChoice,
    colorScheme,
    subColor,
    setSubColor,
  } = useAppTheme();
  const { fontSizeKey, setFontSizeKey } = useContext(FontSizeContext);
  const { t } = useTranslation();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // ★★★ ここで認証の状態とユーザー情報を取得します ★★★
  const { isSignedIn, user, signIn, signOut } = useGoogleAuth();

  const [selectedBgId, setSelectedBgId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadSetting = async () => {
        const savedId = await AsyncStorage.getItem(CALENDAR_BG_KEY);
        setSelectedBgId(savedId || BACKGROUND_IMAGES[0].id);
      };
      loadSetting();
    }, [])
  );

  const styles = createStyles(isDark, subColor, fontSizeKey, isTablet);

  const THEME_OPTIONS: { label: string; value: ThemeChoice }[] = [
    { label: t('settings.theme_system'), value: 'system' },
    { label: t('settings.theme_light'), value: 'light' },
    { label: t('settings.theme_dark'), value: 'dark' },
  ];

  const COLOR_OPTIONS = [
    '#2196F3',
    '#0b9c2f',
    '#4CAF50',
    '#FF9800',
    '#9C27B0',
    '#E91E63',
    isDark ? '#A0A0A0' : '#757575',
  ];

  const FONT_KEYS: FontSizeKey[] = ['small', 'normal', 'medium', 'large'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ... 他のカード（Language, Display Modeなど）は変更なし ... */}

        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.language')}</Text>
          <TouchableOpacity
            style={styles.optionRowButton}
            onPress={() => router.push('/settings/language')}
          >
            <Text style={styles.optionLabel}>
              {i18n.language.startsWith('ja')
                ? `${t('settings.language_ja')}`
                : i18n.language.startsWith('en')
                ? `${t('settings.language_en')}`
                : `${t('settings.language_ko')}`
              }
              <Text style={styles.currentLanguageHint}> ({t('settings.current')})</Text>
            </Text>
            <Ionicons name="chevron-forward" size={fontSizes[fontSizeKey] + 2} color={isDark ? '#A0A0A0' : '#888'} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.display_mode')}</Text>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.optionRowButton}
              onPress={() => setThemeChoice(opt.value)}
            >
              <View style={{flexDirection: 'row', alignItems: 'center', flex:1}}>
                <View
                  style={[
                    styles.radio,
                    themeChoice === opt.value && styles.radioSelected,
                  ]}
                />
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </View>
              {themeChoice === opt.value && (
                 <Ionicons name="checkmark-outline" size={fontSizes[fontSizeKey] + 4} color={subColor} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.sub_color')}</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSubColor(color)}
                style={[
                  styles.colorCircleBase,
                  { backgroundColor: color },
                  subColor === color && styles.colorCircleSelected,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.font_size')}</Text>
          <Slider
            minimumValue={0}
            maximumValue={FONT_KEYS.length - 1}
            step={1}
            value={FONT_KEYS.indexOf(fontSizeKey)}
            onSlidingComplete={(v: number) =>
              setFontSizeKey(FONT_KEYS[Math.round(v)])
            }
            minimumTrackTintColor={subColor}
            maximumTrackTintColor={isDark ? "#555" : "#ccc"}
            thumbTintColor={Platform.OS === 'android' ? subColor : undefined}
            style={styles.slider}
          />
          <View style={styles.fontLabelRow}>
            {FONT_KEYS.map((key) => (
              <Text
                key={key}
                style={[
                  styles.fontLabel,
                  fontSizeKey === key && { color: subColor, fontWeight: 'bold' },
                ]}
              >
                {t(`settings.font_size_${key}` as any)}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.calendar_background')}</Text>
          <View style={styles.thumbnailContainer}>
            {BACKGROUND_IMAGES.map((img) => (
              <TouchableOpacity
                key={img.id}
                onPress={async () => {
                  setSelectedBgId(img.id);
                  await AsyncStorage.setItem(CALENDAR_BG_KEY, img.id);
                }}
              >
                {img.source ? (
                  <Image
                    source={img.source}
                    style={[
                      styles.thumbnail,
                      selectedBgId === img.id && styles.thumbnailSelected,
                    ]}
                  />
                ) : (
                  <View style={[
                    styles.thumbnail,
                    styles.noImageThumbnail,
                    selectedBgId === img.id && styles.thumbnailSelected,
                  ]}>
                    <Ionicons name="close-circle" size={24} color={isDark ? '#888' : '#aaa'} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.repeating_tasks_title')}</Text>
          <TouchableOpacity
            style={styles.optionRowButton}
            onPress={() => router.push('/settings/repeating-tasks')}
          >
            <Text style={styles.optionLabel}>
              {t('settings.manage_repeating_tasks')}
            </Text>
            <Ionicons name="chevron-forward" size={fontSizes[fontSizeKey] + 2} color={isDark ? '#A0A0A0' : '#888'} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.google_calendar_integration', 'Googleカレンダー連携')}</Text>
          <TouchableOpacity
            style={styles.optionRowButton}
            onPress={() => {
              if (isSignedIn) {
                Alert.alert(
                  t('settings.google_calendar_integration', 'Googleカレンダー連携'),
                  t('settings.disconnect_confirm', '連携を解除しますか？'),
                  [
                    { text: t('common.cancel', 'キャンセル'), style: 'cancel' },
                    { text: t('common.ok', 'OK'), onPress: signOut },
                  ]
                );
              } else {
                signIn();
              }
            }}
          >
            <Text style={styles.optionLabel} numberOfLines={1}>
              {isSignedIn ? t('settings.connected', '連携済み') : t('settings.not_connected', '未連携')}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (
  isDark: boolean,
  subColor: string,
  fsKey: keyof typeof fontSizes,
  isTablet: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0C0C0C' : '#f2f2f4' },
    scrollContent: {
      paddingTop: 16,
      paddingBottom: 32,
      paddingHorizontal: isTablet ? 32 : 16,
    },
    appBar: {
      height: 56,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#3A3A3C' : '#C6C6C8',
    },
    appBarTitle: {
      fontSize: fontSizes[fsKey] + (Platform.OS === 'ios' ? 2 : 1),
      fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
      color: isDark ? '#EFEFF0' : '#1C1C1E',
    },
    card: {
      backgroundColor: isDark ? '#1f1f21' : '#FFFFFF',
      borderRadius: Platform.OS === 'ios' ? 10 : 8,
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    label: {
      fontSize: fontSizes[fsKey] + (Platform.OS === 'ios' ? 1 : 0),
      fontWeight: Platform.OS === 'ios' ? '500' : '600',
      color: subColor,
      paddingTop: 16,
      paddingBottom: 8,
    },
    optionRowButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? '#3A3A3C' : '#E0E0E0',
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: isDark ? '#5A5A5E' : '#AEAEB2',
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioSelected: {
      borderColor: subColor,
    },
    optionLabel: {
      fontSize: fontSizes[fsKey] + (Platform.OS === 'ios' ? 2 : 1),
      color: isDark ? '#EFEFF0' : '#1C1C1E',
      flexShrink: 1,
    },
    currentLanguageHint: {
      fontSize: fontSizes[fsKey] -1,
      color: isDark ? '#bbbbbf' : '#2d2d2e',
    },
    colorRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 12,
    },
    colorCircleBase: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorCircleSelected: {
      borderColor: subColor,
      transform: [{ scale: 1.1 }],
    },
    slider: {
        marginVertical: Platform.OS === 'ios' ? 10 : 0,
    },
    fontLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 8,
      paddingBottom: 12,
    },
    fontLabel: {
      fontSize: fontSizes[fsKey] - (Platform.OS === 'ios' ? 0 : 1),
      color: isDark ? '#8E8E93' : '#6D6D72',
    },
    thumbnailContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      paddingTop: 8,
      paddingBottom: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? '#3A3A3C' : '#E0E0E0',
    },
    thumbnail: {
      width: isTablet ? 100 : 80,
      height: isTablet ? 100 : 80,
      borderRadius: 8,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    thumbnailSelected: {
      borderColor: subColor,
    },
    noImageThumbnail: {
      backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });