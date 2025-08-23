import TabBar from '../components/TabBar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabStackParamList } from '../types/navigation';
import CalendarTabStack from './tabs/CalendarTabStack';
import ChartTabStack from './tabs/ChartTabStack';
import NotesTabStack from './tabs/NotesTabStack';
import PrioritiesTabStack from './tabs/PrioritiesTabStack';
import ProfileTabStack from './tabs/ProfileTabStack';

const BottomTabNavigator = () => {
  const Tab = createBottomTabNavigator<BottomTabStackParamList>();

  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />}
      backBehavior='history'
      initialRouteName='Priorities'
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
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