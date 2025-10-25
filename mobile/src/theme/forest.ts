import { ThemeMode, ThemeType } from "../types/ThemeType";

const defaultFonts = {
  regular: { fontFamily: 'System', fontWeight: 'normal' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  heavy: { fontFamily: 'System', fontWeight: '900' },
} as const; // keeps fontWeight as literal, not string

export const ForestThemes: Record<ThemeMode, ThemeType> = {
  light: {
    dark: false,
    colors: {
      primary: '#2E7D32',
      background: '#FFFFFF',
      card: '#E8F5E9',
      text: '#000000',
      border: '#C8E6C9',
      notification: '#43A047',
    },
    fonts: defaultFonts,
  },
  dark: {
    dark: true,
    colors: {
      primary: '#66BB6A',
      background: '#0D0D0D',
      card: '#1B2A1B',
      text: '#FFFFFF',
      border: '#2E7D32',
      notification: '#81C784',
    },
    fonts: defaultFonts,
  },
};
