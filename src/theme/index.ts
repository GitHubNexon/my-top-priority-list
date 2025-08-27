import { ThemeFamily, ThemeMode, ThemeType } from '../types/ThemeType';
import { BlueThemes } from './blue';
import { DefaultDarkTheme, DefaultLightTheme } from './default';
import { ForestThemes } from './forest';

export const Themes: Record<ThemeFamily, Record<ThemeMode, ThemeType>> = {
  default: {
    light: DefaultLightTheme,
    dark: DefaultDarkTheme,
  },
  blue: BlueThemes,
  forest: ForestThemes,
};

export * from '../types/ThemeType';
