'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'rose' | 'lavender' | 'emerald' | 'gold' | 'ocean';

export interface PaletteInfo {
  id: ThemePalette;
  name: string;
  nameEn: string;
  emoji: string;
  primaryColor: string;
  accentColor: string;
}

export const PALETTES: PaletteInfo[] = [
  {
    id: 'rose',
    name: 'Rosa Terciopelo',
    nameEn: 'Velvet Rose',
    emoji: '🌹',
    primaryColor: '#E6396F',
    accentColor: '#9D174D',
  },
  {
    id: 'lavender',
    name: 'Lavanda & Amatista',
    nameEn: 'Lavender & Amethyst',
    emoji: '🪻',
    primaryColor: '#8B5CF6',
    accentColor: '#6D28D9',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Botánica',
    nameEn: 'Botanical Emerald',
    emoji: '🍃',
    primaryColor: '#059669',
    accentColor: '#047857',
  },
  {
    id: 'gold',
    name: 'Oro Champaña',
    nameEn: 'Royal Champagne',
    emoji: '✨',
    primaryColor: '#D97706',
    accentColor: '#B45309',
  },
  {
    id: 'ocean',
    name: 'Zafiro Serenidad',
    nameEn: 'Sapphire Serenity',
    emoji: '🌊',
    primaryColor: '#0284C7',
    accentColor: '#0369A1',
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  palette: ThemePalette;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  palette: 'rose',
  toggleTheme: () => {},
  setTheme: () => {},
  setPalette: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [palette, setPaletteState] = useState<ThemePalette>('rose');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('amarfe_theme') as ThemeMode;
    const savedPalette = localStorage.getItem('amarfe_palette') as ThemePalette;

    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (savedPalette && PALETTES.some((p) => p.id === savedPalette)) {
      setPaletteState(savedPalette);
      document.documentElement.setAttribute('data-palette', savedPalette);
    } else {
      document.documentElement.setAttribute('data-palette', 'rose');
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('amarfe_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setPalette = (newPalette: ThemePalette) => {
    setPaletteState(newPalette);
    localStorage.setItem('amarfe_palette', newPalette);
    document.documentElement.setAttribute('data-palette', newPalette);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, palette, toggleTheme, setTheme, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
