// hooks/ThemeContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ユーザーが選べるモード
export type ThemeChoice = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  themeChoice: ThemeChoice
  setThemeChoice: (t: ThemeChoice) => void
  colorScheme: 'light' | 'dark'
  subColor: string
  setSubColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  themeChoice: 'light',
  setThemeChoice: () => {},
  colorScheme: 'light',
  subColor: '#4CAF50',
  setSubColor: () => {},
})

// ライト／ダーク判定ヘルパー
function normalizeScheme(scheme?: string | null): 'light' | 'dark' {
  return scheme === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    () => normalizeScheme(Appearance.getColorScheme())
  )
  const [themeChoice, setThemeChoiceState] = useState<ThemeChoice>('light')
  const [subColor, setSubColorState] = useState('#4CAF50') // デフォルト緑

  useEffect(() => {
    const sub = Appearance.addChangeListener(evt => {
      setSystemScheme(normalizeScheme(evt.colorScheme))
    })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    AsyncStorage.getItem('USER_THEME').then(val => {
      if (val === 'system' || val === 'light' || val === 'dark') {
        setThemeChoiceState(val)
      }
    })
    AsyncStorage.getItem('USER_SUBCOLOR').then(val => {
      if (val) setSubColorState(val)
    })
  }, [])

  const setThemeChoice = (t: ThemeChoice) => {
    setThemeChoiceState(t)
    AsyncStorage.setItem('USER_THEME', t)
  }

  const setSubColor = (color: string) => {
    setSubColorState(color)
    AsyncStorage.setItem('USER_SUBCOLOR', color)
  }

  const colorScheme: 'light' | 'dark' =
    themeChoice === 'system' ? systemScheme : themeChoice

  return (
    <ThemeContext.Provider
      value={{ themeChoice, setThemeChoice, colorScheme, subColor, setSubColor }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  return useContext(ThemeContext)
}
