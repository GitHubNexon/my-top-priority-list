import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import TabBarButton from './TabBarButton';

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View
      style={[
        styles.tabBar,
        { display: isKeyboardVisible ? 'none' : 'flex' }
      ]}
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
            color={isFocused ? '#2E640' : '#FFF'}
            label={label}
            tabBarHideOnKeyboard={true}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#303030',
    paddingVertical: 12,
    borderWidth: 2.5,
    borderColor: '#242323',
    elevation: 10,
  },
});

export default TabBar;