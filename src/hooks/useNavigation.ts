// hooks/useNavigationTyped.ts
import {
  createNavigationContainerRef,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, BottomTabStackParamList } from "../types/navigation";

export function useNavigationTyped() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
};

export function useTabsNavigationTyped() {
  return useNavigation<NativeStackNavigationProp<BottomTabStackParamList>>();
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const isReadyRef = { current: false };
export const pendingNavigation: (() => void)[] = [];

export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[RouteName]
    ? [screen: RouteName, params?: RootStackParamList[RouteName]]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
) {
  if (isReadyRef.current && navigationRef.isReady()) {
    // @ts-expect-error – TS can't infer overloads here but it's valid
    navigationRef.navigate(...args);
  } else {
    // push into queue
    pendingNavigation.push(() => {
      // @ts-expect-error – TS can't infer overloads here but it's valid
      navigationRef.navigate(...args);
    });
  }
}
