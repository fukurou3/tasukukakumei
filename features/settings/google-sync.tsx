// features/settings/google-sync.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Button, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth'; // 前回作成した認証フック

export default function GoogleSyncSettingsScreen() {
  const { colorScheme, subColor } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const router = useRouter();
  const styles = createGoogleSyncStyles(isDark, subColor);

  const { user, isSignedIn, signIn, signOut, isSigningIn } = useGoogleAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={subColor} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{t('settings.google_calendar_integration')}</Text>
        <View style={styles.appBarActionPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.connection_status', '連携ステータス')}</Text>
          {isSigningIn ? (
            <ActivityIndicator style={styles.loader} color={subColor} />
          ) : isSignedIn && user ? (
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={24} color={'#4CAF50'} style={styles.statusIcon} />
              <View>
                <Text style={styles.statusText}>{t('settings.connected_as', { name: user.name })}</Text>
                <Text style={styles.emailText}>{user.email}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Ionicons name="close-circle" size={24} color={'#D9534F'} style={styles.statusIcon} />
              <Text style={styles.statusText}>{t('settings.not_connected', '未連携')}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {isSignedIn ? (
            <Button title={t('settings.logout', 'ログアウト')} onPress={signOut} color={isDark ? '#FF6961' : '#D9534F'} />
          ) : (
            <Button title={t('settings.login_with_google', 'Googleアカウントでログイン')} onPress={signIn} disabled={isSigningIn} />
          )}
        </View>

        <Text style={styles.footerText}>
          {t('settings.google_sync_description', 'Googleアカウントと連携することで、カレンダーの予定を双方向で同期できるようになります。')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createGoogleSyncStyles = (isDark: boolean, subColor: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000000' : '#F2F2F7',
  },
  appBar: {
    height: Platform.OS === 'ios' ? 44 : 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
    backgroundColor: isDark ? '#1C1C1E' : '#F9F9F9',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  appBarTitle: {
    fontSize: Platform.OS === 'ios' ? 17 : 20,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: isDark ? '#FFFFFF' : '#000000',
    textAlign: 'center',
    flex: 1,
  },
  appBarActionPlaceholder: {
    width: (Platform.OS === 'ios' ? 32 : 24) + 8,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: Platform.OS === 'ios' ? 10 : 8,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: subColor,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    fontSize: 17,
    color: isDark ? '#EFEFF0' : '#1C1C1E',
    fontWeight: '500',
  },
  emailText: {
    fontSize: 14,
    color: isDark ? '#8E8E93' : '#6D6D72',
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 10,
  },
  loader: {
    marginVertical: 10,
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 13,
    color: isDark ? '#8E8E93' : '#6D6D72',
    lineHeight: 18,
  }
});