import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabStackParamList } from '../types/navigation';
import {
  CalendarTabStack,
  ChartTabStack,
  NotesTabStack,
  PrioritiesTabStack,
  ProfileTabStack,
} from './tabs/index';
import ThemedTabBar from '../components/TabBar';

const BottomTabNavigator = () => {
  const Tab = createBottomTabNavigator<BottomTabStackParamList>();

  return (
    <Tab.Navigator
      tabBar={ThemedTabBar}
      /**
         * @detachInactiveScreens
         * Should set to TRUE
         * so it don’t take GPU/CPU resources,
         * but their React state is still kept in memory
         * 
         * @lazy
         * Should set to TRUE
         * faster startup and
         * will only mounted the first time you visit them
         * 
         * @freezeOnBlur
         * Should set to FALSE
         * for background UPDATES
         * and useEffect
         */
      detachInactiveScreens={true}
      //initialRouteName='Profile'
      backBehavior="history"
      screenOptions={{
        lazy: true,
        headerShown: false,
        freezeOnBlur: false,
      }}
    >
      <Tab.Screen
        name='Priorities'
        component={PrioritiesTabStack}
      />
      <Tab.Screen
        name='Notes'
        component={NotesTabStack}
      />
      <Tab.Screen
        name='Calendar'
        component={CalendarTabStack}
      />
      <Tab.Screen
        name='Chart'
        component={ChartTabStack}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileTabStack}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;