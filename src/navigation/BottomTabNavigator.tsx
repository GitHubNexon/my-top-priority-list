import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabStackParamList } from '../types/navigation';
import {
  CalendarTabStack,
  ChartTabStack,
  NotesTabStack,
  PrioritiesTabStack,
  ProfileTabStack,
} from './tabs/index';
import { useTheme } from '../hooks';
import ThemedTabBar from '../components/TabBar';

const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const Tab = createBottomTabNavigator<BottomTabStackParamList>();

  return (
    <Tab.Navigator tabBar={ThemedTabBar}
      backBehavior='history'
      initialRouteName='Priorities'
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
          height: 100,
        },
        headerTintColor: theme.colors.text,
        headerTitleAlign: 'center',
        animation: 'none',
        lazy: true,
        freezeOnBlur: true,
      }}
    >
      <Tab.Screen
        name='Profile'
        component={ProfileTabStack}
      />
      <Tab.Screen
        name='Notes'
        component={NotesTabStack}
      />
      <Tab.Screen
        name='Priorities'
        component={PrioritiesTabStack}
      />
      <Tab.Screen
        name='Calendar'
        component={CalendarTabStack}
      />
      <Tab.Screen
        name='Chart'
        component={ChartTabStack}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;