// hooks/useNavigationTyped.ts
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, BottomTabStackParamList } from "../types/navigation";

export function useNavigationTyped() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
};

export function useTabsNavigationTyped() {
  return useNavigation<NativeStackNavigationProp<BottomTabStackParamList>>();
};
