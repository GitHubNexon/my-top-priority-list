import { Theme } from '@react-navigation/native';

export type ThemeMode = 'light' | 'dark';
export type ThemeFamily = 'default' | 'blue' | 'forest';

export type ThemeType = Theme & {
  fonts?: {
    regular: { fontFamily: string; fontWeight?: string };
    medium: { fontFamily: string; fontWeight?: string };
    bold: { fontFamily: string; fontWeight?: string };
    heavy: { fontFamily: string; fontWeight?: string };
  };
};

export interface CustomTheme extends Theme {
  myColors?: {
    primary: string;
    triadic: string;
    analogous: string;
    complementary: string;
  };
  fontColors?: {
    primary: string;
    secondary: string;
  };
}
