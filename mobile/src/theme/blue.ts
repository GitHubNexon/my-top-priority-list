import { ThemeMode, ThemeType } from "../types/ThemeType";

const defaultFonts = {
  regular: { fontFamily: 'System', fontWeight: 'normal' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  heavy: { fontFamily: 'System', fontWeight: '900' },
} as const; // keeps fontWeight as literal, not string

export const BlueThemes: Record<ThemeMode, ThemeType> = {
  light: {
    dark: false,
    colors: {
      primary: '#2979FF',
      background: '#FFFFFF',
      card: '#F0F4FF',
      text: '#000000',
      border: '#E2E2E2',
      notification: '#FF3B30',
    },
    fonts: defaultFonts,
  },
  dark: {
    dark: true,
    colors: {
      primary: '#82B1FF',
      background: '#121212',
      card: '#1E1E2C',
      text: '#FFFFFF',
      border: '#272727',
      notification: '#FF453A',
    },
    fonts: defaultFonts,
  },
};
