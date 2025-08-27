import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import TabBarButton from './TabBarButton';
import { useTheme } from '../hooks';
import { useNavBarType } from '../hooks';

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { theme } = useTheme();
  const { navigationType } = useNavBarType();

  const navBarPadding = navigationType === 'gesture' ? 8
    : navigationType === '2-button' ? 14
      : navigationType === '3-button' ? 30 : 8

  return (
    <View
      style={[styles.tabBar, {
        backgroundColor: theme.colors.primary,
        paddingBottom: navBarPadding,
      }]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const rawLabel =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const label = typeof rawLabel === 'string' ? rawLabel : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            label={label}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
  },
});

const ThemedTabBar = (props: BottomTabBarProps) => {
  return <TabBar {...props} />;
};

export default ThemedTabBar;