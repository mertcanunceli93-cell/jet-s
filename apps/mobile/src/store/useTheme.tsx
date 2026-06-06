import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type Theme = 'dark' | 'light';

interface ThemeColors {
  bg: string;
  card: string;
  cardBorder: string;
  text: string;
  subtext: string;
  muted: string;
  accent: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
  headerBg: string;
  separator: string;
}

const DARK: ThemeColors = {
  bg: '#0B1220',
  card: '#111827',
  cardBorder: 'rgba(255,255,255,0.05)',
  text: '#FFFFFF',
  subtext: '#AAAAAA',
  muted: '#555555',
  accent: '#FF7A00',
  inputBg: '#0D1525',
  tabBar: '#111827',
  tabBarBorder: '#1f2a3c',
  headerBg: '#111827',
  separator: 'rgba(255,255,255,0.06)',
};

const LIGHT: ThemeColors = {
  bg: '#F0F4F8',
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.07)',
  text: '#111827',
  subtext: '#6B7280',
  muted: '#9CA3AF',
  accent: '#FF7A00',
  inputBg: '#F9FAFB',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  headerBg: '#FFFFFF',
  separator: 'rgba(0,0,0,0.06)',
};

interface ThemeCtx {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: 'dark',
  colors: DARK,
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    SecureStore.getItemAsync('app_theme').then((v: string | null) => {
      if (v === 'light' || v === 'dark') setTheme(v as Theme);
      return null;
    });
  }, []);

  const toggleTheme = async () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    await SecureStore.setItemAsync('app_theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: theme === 'dark' ? DARK : LIGHT, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export { DARK, LIGHT };
