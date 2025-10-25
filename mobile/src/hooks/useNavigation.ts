// hooks/useNavigationTyped.ts
import {
  createNavigationContainerRef,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type {
  RootStackParamList,
  BottomTabStackParamList,
  NotesTabStackParamList,
  ProfileTabStackParamList,
  PrioritiesTabStackParamList,
  CalendarTabStackParamList,
  ChartTabStackParamList,
} from '../types/navigation';

export function useNavigationTyped() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

export function useTabsNavigationTyped() {
  return useNavigation<NativeStackNavigationProp<BottomTabStackParamList>>();
}

// Hooks for each nested stack
export function useNotesNavigation() {
  return useNavigation<NativeStackNavigationProp<NotesTabStackParamList>>();
}

export function useProfileNavigation() {
  return useNavigation<NativeStackNavigationProp<ProfileTabStackParamList>>();
}

export function usePrioritiesNavigation() {
  return useNavigation<
    NativeStackNavigationProp<PrioritiesTabStackParamList>
  >();
}

export function useCalendarNavigation() {
  return useNavigation<NativeStackNavigationProp<CalendarTabStackParamList>>();
}

export function useChartNavigation() {
  return useNavigation<NativeStackNavigationProp<ChartTabStackParamList>>();
}

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
