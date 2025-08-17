import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    ViewStyle,
    TextStyle,
    StyleProp,
    useWindowDimensions,
} from 'react-native';

interface ToastProps {
    message: string;
    visible: boolean;
    duration?: number;
    onHide?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const Toast: React.FC<ToastProps> = ({
    message,
    visible,
    duration = 2000,
    onHide,
    containerStyle,
    textStyle,
}) => {
    const { height } = useWindowDimensions();

    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Fade in
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // After delay, fade out
                setTimeout(() => {
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        onHide?.();
                    });
                }, duration);
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[
            styles.toastContainer,
            containerStyle,
            { opacity },
            {
                bottom: height - 35,
            }
        ]}>
            <Text style={[styles.toastText, textStyle]}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#333',
        paddingVertical: 10,
        paddingHorizontal: 20,
        margin: 10,
        borderRadius: 100,
        zIndex: 1000,
    },
    toastText: {
        color: 'white',
        fontSize: 14,
    },
});

export default Toast;