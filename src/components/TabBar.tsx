import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { Keyboard, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import {
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import TabBarButton from './TabBarButton';

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  /**
   * Block of codes for 
   * measuring the tab bar width
   * by dividing into number of tabBar item
   * And changing the background properties based on onPress function
   */
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const buttonWidth = dimensions.width / state.routes.length;

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    })
  };

  const tabPositionX = useSharedValue(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Ensure this reacts when the focused tab (state.index) changes
    tabPositionX.value = withSpring(buttonWidth * state.index, { duration: 100 });
  }, [state.index, buttonWidth, tabPositionX]);

  if (isKeyboardVisible) return null;

  return (
    <View onLayout={onTabBarLayout} style={styles.tabBar}>
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
          tabPositionX.value = withSpring(buttonWidth * index, { duration: 100 })

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
            tabBarShowLabel={false}
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
    backgroundColor: '#ffff',
    paddingVertical: 12,
    borderWidth: 2.5,
    borderColor: '#FFFF',
    elevation: 10,
  },
});

export default TabBar;