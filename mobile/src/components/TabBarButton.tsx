/* eslint-disable react-native/no-inline-styles */
import { BottomTabIcons } from '../icons';
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
    const primaryFontColor = theme.fontColors?.primary;
    const secondaryFontColor = theme.fontColors?.secondary;

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: isFocused ? withSpring(1) : withSpring(0.8) }]
        }
    }, [isFocused]);

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItems}
        >
            <Animated.View style={animatedIconStyle}>
                {BottomTabIcons[routeName]?.({ color: isFocused ? '#68BA7F' : secondaryFontColor, size: 32, isFocused })}
            </Animated.View>
            <Text style={{
                color: isFocused ? primaryFontColor : secondaryFontColor,
                fontSize: 12,
                fontWeight: isFocused ? 600 : 400
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
        gap: 4,
        paddingBottom: 14,
    },
});

export default TabBarButton;