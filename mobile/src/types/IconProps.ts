import { StyleProp, TextStyle } from 'react-native';

export type IconProps = {
  style?: StyleProp<TextStyle>;
  icon?: string;
  size?: number;
  color?: string;
  enableFill?: boolean;
  isFocused?: boolean;
};
