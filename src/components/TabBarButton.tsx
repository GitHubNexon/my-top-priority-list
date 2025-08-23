import BottomTabIcons from '../constant/BottomTabIcons';
import { GestureResponderEvent, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
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
        tabBarHideOnKeyboard,
    }: {
        onPress: (event: GestureResponderEvent) => void,
        onLongPress: (event: GestureResponderEvent) => void,
        isFocused: boolean,
        routeName: string,
        color: string,
        label: string,
        tabBarHideOnKeyboard: boolean,
    }) => {

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: isFocused ? withSpring(1.25) : withSpring(1) }]
        }
    }, [isFocused]);

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItems}
        >
            <Animated.View style={animatedIconStyle}>
                {BottomTabIcons[routeName]?.({ color: isFocused ? '#17c200d3' : '#9e9e9e', size: 32, isFocused })}
            </Animated.View>
            <Text style={{
                color: isFocused ? '#17c200d3' : '#c9c9c9',
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
        paddingBottom: 25
    },
});

export default TabBarButton;