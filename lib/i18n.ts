// lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'
import en from '../locales/en.json'
import ja from '../locales/ja.json'
import ko from '../locales/ko.json'

export const LANGUAGE_KEY = 'APP_LANGUAGE'

const resources = {
  en: { translation: en },
  ja: { translation: ja },
  ko: { translation: ko },
}

async function getInitialLanguage(): Promise<string> {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY)
  if (saved) return saved
  const locale = Localization.locale ?? ''
  if (locale.startsWith('ko')) return 'ko'
  if (locale.startsWith('ja')) return 'ja'
  return 'en'
}

export async function initI18n() {
  const lng = await getInitialLanguage()
  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: { escapeValue: false },
  })
}

export async function changeAppLanguage(lng: string) {
  await i18n.changeLanguage(lng)
  await AsyncStorage.setItem(LANGUAGE_KEY, lng)
}

export default i18n
