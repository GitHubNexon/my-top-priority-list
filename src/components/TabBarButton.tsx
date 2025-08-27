/* eslint-disable react-native/no-inline-styles */
import BottomTabIcons from '../constant/BottomTabIcons';
import { GestureResponderEvent, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import { useTheme } from '../hooks';

const TabBarButton = (
    {
        onPress,
        onLongPress,
        isFocused,
        routeName,
        label,
    }: {
        onPress: (event: GestureResponderEvent) => void,
        onLongPress: (event: GestureResponderEvent) => void,
        isFocused: boolean,
        routeName: string,
        label: string,
    }) => {
    const { theme } = useTheme();
    const themeColor = theme.colors.border;

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: isFocused ? withSpring(1.2) : withSpring(1) }]
        }
    }, [isFocused]);

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItems}
        >
            <Animated.View style={animatedIconStyle}>
                {BottomTabIcons[routeName]?.({ color: isFocused ? '#17c200d3' : themeColor, size: 32, isFocused })}
            </Animated.View>
            <Text style={{
                color: isFocused ? '#17c200d3' : themeColor,
                fontSize: isFocused ? 12 : 10
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
        paddingBottom: 14,
    },
});

export default TabBarButton;