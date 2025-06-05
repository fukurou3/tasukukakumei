// app/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'
import en from '../locales/en.json'
import ja from '../locales/ja.json'
import ko from '../locales/ko.json'

// 翻訳リソース
const resources = {
  en: { translation: en },
  ja: { translation: ja },
  ko: { translation: ko },
}

// i18n初期化
i18n
  .use(initReactI18next)
  .init({
    resources, // optionsに渡す（正しい位置）
    lng: Localization.locale.startsWith('ko') ? 'ko' : Localization.locale.startsWith('ja') ? 'ja' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
