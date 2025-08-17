import BottomTabIcons from '../constant/BottomTabIcons';
import { useEffect } from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const TabBarButton = (
    {
        onPress,
        onLongPress,
        isFocused,
        routeName,
        color,
        label,
        tabBarShowLabel,
        tabBarHideOnKeyboard,
    }: {
        onPress: (event: GestureResponderEvent) => void,
        onLongPress: (event: GestureResponderEvent) => void,
        isFocused: boolean,
        routeName: string,
        color: string,
        label: string,
        tabBarShowLabel: boolean,
        tabBarHideOnKeyboard: boolean,
    }) => {
    /**
     * This block of codes is for disappearing text animation
     * in tab bar
     */
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(
            typeof isFocused === 'boolean'
                ? (isFocused ? 1 : 0) : isFocused, { duration: 100 }
        );
    }, [scale, isFocused]);

    /**
     * This block of codes is for icon animation
     * when isFocused or switching between tab bars
     * and the text is disappearing and
     * increasing the size of icons
     */
    const animatedIconStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(scale.value, [0, 1], [1, 1.25]);

        return {
            transform: [{
                scale: scaleValue
            }]
        }
    })

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItems}
        >
            <Animated.View style={animatedIconStyle}>
                {BottomTabIcons[routeName]?.({ color: isFocused ? '#17c200d3' : '#253D2C', size: 32, isFocused })}
            </Animated.View>
            <Text style={{
                color: isFocused ? '#17c200d3' : '#253D2C',
                fontSize: isFocused ? 14 : 10
            }}
            >
                {label}
            </Text>
        </Pressable>
    )
};

const styles = StyleSheet.create({
    tabBarItems: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        paddingBottom: 5
    },
});

export default TabBarButton;