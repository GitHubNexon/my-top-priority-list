import { CustomTheme } from '../types/ThemeType';

const defaultFonts = {
  regular: { fontFamily: 'System', fontWeight: 'normal' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  heavy: { fontFamily: 'System', fontWeight: '900' },
} as const; // keeps fontWeight as literal, not string

export const DefaultLightTheme: CustomTheme = {
  dark: false,
  colors: {
    primary: '#F1F1F1',
    background: '#E4E4E4',
    card: '#F2F2F2',
    text: '#000000',
    border: '#555555',
    notification: '#FF3B30',
  },
  fonts: defaultFonts,
  myColors: {
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
    muted: '#9E9E9E',
  },
};

export const DefaultDarkTheme: CustomTheme = {
  dark: true,
  colors: {
    primary: '#202020',
    background: '#303030',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#9E9E9E',
    notification: '#FF453A',
  },
  fonts: defaultFonts,
  myColors: {
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
    muted: '#9E9E9E',
  },
};
