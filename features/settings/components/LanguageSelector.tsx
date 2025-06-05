// app/language.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function LanguageScreen() {
  const { i18n, t } = useTranslation()
  const router = useRouter()
  const currentLang = i18n.language

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{t('settings.select_language')}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  appBar: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16 },
  backButton: { fontSize: 24, marginRight: 12 },
  appBarTitle: { fontSize: 20, fontWeight: 'bold' },
  options: { marginTop: 32, paddingHorizontal: 20 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  optionText: { fontSize: 18 },
  checkmark: { fontSize: 18 },
})
