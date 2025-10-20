import { CustomTheme } from '../types/ThemeType';

const defaultFonts = {
  regular: { fontFamily: 'System', fontWeight: 'normal' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  heavy: { fontFamily: 'System', fontWeight: '900' },
} as const; // keeps fontWeight as literal, not string

export const DefaultLightTheme: CustomTheme = {
  dark: false,
  // https://colorhunt.co/palette/fffbf5f7efe5c3acd07743db
  colors: {
    primary: '#FFFBF5',
    background: '#F7EFE5',
    card: '#FFFBF5',
    text: 'red',
    border: '#DEDCD5',
    notification: '#7743DB',
  },
  fonts: defaultFonts,
  // https://colorhunt.co/palette/fffbf5f7efe5c3acd07743db
  myColors: {
    primary: '#FFFBF5',
    triadic: '#F7EFE5',
    analogous: '#C3ACD0',
    complementary: '#7743DB',
  },
  fontColors: {
    primary: '#202020',
    secondary: '#575757',
  },
};

export const DefaultDarkTheme: CustomTheme = {
  dark: true,
  // https://colorhunt.co/palette/222831393e46948979dfd0b8
  colors: {
    primary: '#222831',
    background: '#393E46',
    card: '#222831',
    text: '#E1E1E1',
    border: '#49454F',
    notification: '#DFD0B8',
  },
  fonts: defaultFonts,
  // https://colorhunt.co/palette/222831393e46948979dfd0b8
  myColors: {
    primary: '#222831',
    triadic: '#393E46',
    analogous: '#948979',
    complementary: '#DFD0B8',
  },
  fontColors: {
    primary: '#E1E1E1',
    secondary: '#B3B3B3',
  },
};
