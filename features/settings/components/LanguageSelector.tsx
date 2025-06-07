// app/language.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { changeAppLanguage } from '@/lib/i18n'
import { useAppTheme } from '@/hooks/ThemeContext'

export default function LanguageScreen() {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const currentLang = i18n.language
  const { colorScheme, subColor } = useAppTheme()
  const isDark = colorScheme === 'dark'
  const styles = createLanguageStyles(isDark, subColor)

  const changeLanguage = async (lng: string) => {
    await changeAppLanguage(lng)
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={subColor} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{t('settings.select_language')}</Text>
        <View style={styles.appBarActionPlaceholder} />
      </View>

      <View style={styles.options}>
        <TouchableOpacity style={styles.optionRow} onPress={() => changeLanguage('ja')}>
          <Text style={styles.optionText}>{t('settings.language_ja')}</Text>
          {currentLang.startsWith('ja') && <Text style={styles.checkmark}>☑</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow} onPress={() => changeLanguage('en')}>
          <Text style={styles.optionText}>{t('settings.language_en')}</Text>
          {currentLang.startsWith('en') && <Text style={styles.checkmark}>☑</Text>}
        </TouchableOpacity>
                <TouchableOpacity style={styles.optionRow} onPress={() => changeLanguage('ko')}>
          <Text style={styles.optionText}>{t('settings.language_ko')}</Text>
          {currentLang.startsWith('ko') && <Text style={styles.checkmark}>☑</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const createLanguageStyles = (isDark: boolean, subColor: string) =>
  StyleSheet.create({
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
    options: {
      padding: 20,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? '#3A3A3C' : '#E0E0E0',
    },
    optionText: {
      fontSize: 18,
      color: isDark ? '#EFEFF0' : '#1C1C1E',
    },
    checkmark: {
      fontSize: 18,
      color: subColor,
    },
  })
