import { ViewStyle } from "react-native";

export type WrapperProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
};