import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<BottomTabStackParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type BottomTabStackParamList = {
  Priorities: NavigatorScreenParams<PrioritiesTabStackParamList>;
  Profile: NavigatorScreenParams<ProfileTabStackParamList>;
  Notes: NavigatorScreenParams<NotesTabStackParamList>;
  Calendar: NavigatorScreenParams<CalendarTabStackParamList>;
  Chart: NavigatorScreenParams<ChartTabStackParamList>;
};

export type ProfileTabStackParamList = {
  ProfileScreen: undefined;
  AppSettingsScreen: undefined;
  FaQScreen: undefined;
};

export type PrioritiesTabStackParamList = {
  PrioritiesScreen: undefined;
  NoteDetailsScreen: undefined;
};

export type NotesTabStackParamList = {
  NotesScreen: undefined;
  NotesDetailScreen: undefined;
};

export type CalendarTabStackParamList = {
  CalendarScreen: undefined;
  CurrentNotesScreen: undefined;
};

export type ChartTabStackParamList = {
  ChartScreen: undefined;
  MoreDetailsScreen: undefined;
};
