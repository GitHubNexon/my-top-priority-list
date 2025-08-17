import { NotesCategoryIcon, PlusIcon } from '../constant/NotesIcons';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';

type FloatingActionButtonAddProp = {
    onPress: (screenName: string) => void;
};

const AddNotesFAB = ({ onPress }: FloatingActionButtonAddProp) => {
    const workIconValue = useSharedValue(30);
    const healthIconValue = useSharedValue(30);
    const financeIconValue = useSharedValue(30);
    const hobbyIconValue = useSharedValue(30);
    const spiritualIconValue = useSharedValue(30);
    const otherIconValue = useSharedValue(30);
    const isOpen = useSharedValue(false)
    const progress = useDerivedValue(() =>
        isOpen.value ? withTiming(1) : withTiming(0),
    );

    const handlePress = (() => {
        const config = {
            easing: Easing.bezier(.76, -0.01, .16, 1.15),
            duration: 300,
        };
        // Define your reusable spring config
        const springConfig = {
            damping: 10,
            stiffness: 100,
            mass: .4,
        };

        if (isOpen.value) {
            workIconValue.value = withDelay(300, withTiming(30, config));
            healthIconValue.value = withDelay(200, withTiming(30, config));
            spiritualIconValue.value = withDelay(100, withTiming(30, config));
            financeIconValue.value = withDelay(50, withTiming(30, config));
            hobbyIconValue.value = withDelay(50, withTiming(30, config));
            otherIconValue.value = withTiming(30, config);
        } else {
            workIconValue.value = withDelay(300, withSpring(350, springConfig));
            healthIconValue.value = withDelay(200, withSpring(300, springConfig));
            spiritualIconValue.value = withDelay(100, withSpring(250, springConfig));
            financeIconValue.value = withDelay(50, withSpring(200, springConfig));
            hobbyIconValue.value = withSpring(150, springConfig);
            otherIconValue.value = withSpring(100, springConfig);
        }
        isOpen.value = !isOpen.value;
    });

    const workIcon = useAnimatedStyle(() => {
        const scale = interpolate(
            workIconValue.value,
            [30, 350],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            bottom: workIconValue.value,
            transform: [{ scale: scale }],
        };
    });

    const healthIcon = useAnimatedStyle(() => {
        const scale = interpolate(
            healthIconValue.value,
            [30, 300],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            bottom: healthIconValue.value,
            transform: [{ scale: scale }],
        };
    });

    const spiritualIcon = useAnimatedStyle(() => {
        const scale = interpolate(
            spiritualIconValue.value,
            [30, 250],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            bottom: spiritualIconValue.value,
            transform: [{ scale: scale }],
        };
    });

    const financeIcon = useAnimatedStyle(() => {
        const scale = interpolate(
            financeIconValue.value,
            [30, 200],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            bottom: financeIconValue.value,
            transform: [{ scale: scale }],
        };
    });

    const hobbyIcon = useAnimatedStyle(() => {
        const scale = interpolate(
            hobbyIconValue.value,
            [30, 150],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            bottom: hobbyIconValue.value,
            transform: [{ scale: scale }],
        };
    });

    const otherIcon = useAnimatedStyle(() => {
        const scale = interpolate(
            otherIconValue.value,
            [30, 100],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            bottom: otherIconValue.value,
            transform: [{ scale: scale }],
        };
    });

    const plusIcon = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${progress.value * 135}deg` }],
        };
    });

    return (
        <>
            <Animated.View style={[styles.contentContainer, workIcon]}>
                <Pressable
                    onPress={() => onPress('work')}
                >
                    <View style={[styles.iconMenuContainer, { width: 94 }]}>
                        <View style={styles.textMenuPosition}>
                            <Text style={styles.textMenu}>Work</Text>
                        </View>
                        <View style={styles.iconPosition}>
                            <View style={styles.iconContainer}>
                                <NotesCategoryIcon icon={'work'} size={24} color="#CFFFDC" />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
            <Animated.View style={[styles.contentContainer, healthIcon]}>
                <Pressable
                    onPress={() => onPress('health')}
                >
                    <View style={[styles.iconMenuContainer, { width: 102 }]}>
                        <View style={styles.textMenuPosition}>
                            <Text style={styles.textMenu}>Health</Text>
                        </View>
                        <View style={styles.iconPosition}>
                            <View style={styles.iconContainer}>
                                <NotesCategoryIcon icon={'health'} size={24} color="#CFFFDC" />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
            <Animated.View style={[styles.contentContainer, spiritualIcon]}>
                <Pressable
                    onPress={() => onPress('spiritual')}
                >
                    <View style={[styles.iconMenuContainer, { width: 113 }]}>
                        <View style={styles.textMenuPosition}>
                            <Text style={styles.textMenu}>Spiritual</Text>
                        </View>
                        <View style={styles.iconPosition}>
                            <View style={styles.iconContainer}>
                                <NotesCategoryIcon icon={'spiritual'} size={24} color="#CFFFDC" />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
            <Animated.View style={[styles.contentContainer, financeIcon]}>
                <Pressable
                    onPress={() => onPress('finance')}
                >
                    <View style={[styles.iconMenuContainer, { width: 110 }]}>
                        <View style={styles.textMenuPosition}>
                            <Text style={styles.textMenu}>Finance</Text>
                        </View>
                        <View style={styles.iconPosition}>
                            <View style={styles.iconContainer}>
                                <NotesCategoryIcon icon={'finance'} size={24} color="#CFFFDC" />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
            <Animated.View style={[styles.contentContainer, hobbyIcon]}>
                <Pressable
                    onPress={() => onPress('hobby')}
                >
                    <View style={[styles.iconMenuContainer, { width: 101 }]}>
                        <View style={styles.textMenuPosition}>
                            <Text style={styles.textMenu}>Hobby</Text>
                        </View>
                        <View style={styles.iconPosition}>
                            <View style={styles.iconContainer}>
                                <NotesCategoryIcon icon={'hobby'} size={24} color="#CFFFDC" />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
            <Animated.View style={[styles.contentContainer, otherIcon]}>
                <Pressable
                    onPress={() => onPress('other')}
                >
                    <View style={[styles.iconMenuContainer, { width: 95 }]}>
                        <View style={styles.textMenuPosition}>
                            <Text style={styles.textMenu}>Other</Text>
                        </View>
                        <View style={styles.iconPosition}>
                            <View style={styles.iconContainer}>
                                <NotesCategoryIcon icon={'other'} size={24} color="#CFFFDC" />
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
            <Pressable style={styles.contentContainer} onPress={() => handlePress()}>
                <Animated.View style={[plusIcon]}>
                    <PlusIcon size={55} color="#253D2C" />
                </Animated.View>
            </Pressable>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#2E6F40',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
    },
    contentContainer: {
        position: 'absolute',
        bottom: 30,
        right: 25,
        marginTop: 20,
        zIndex: 1000,
    },
    iconContainer: {
        height: 38,
        width: 38,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E6F40',
        borderRadius: 80,
    },
    iconMenuContainer: {
        height: 45,
        width: 100,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#CFFFDC',
        borderRadius: 40,
    },
    iconPosition: {
        marginRight: -5,
        alignSelf: 'center',
        justifyContent: 'flex-end',
    },
    textMenuPosition: {
        alignSelf: 'center',
        marginRight: 10,
    },
    textMenu: {
        fontSize: 14,
    },
});

export default AddNotesFAB;