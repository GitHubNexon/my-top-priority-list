/* eslint-disable react-native/no-inline-styles */
import {
    Dimensions,
    StyleSheet,
    View
} from 'react-native';
import { NativeStackNavigationOptions, NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { interpolate, interpolateColor, SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../hooks';

interface GenericHeaderProps<T extends Record<string, object | undefined>> {
    navigation: NativeStackNavigationProp<T>;
    route: RouteProp<T, keyof T>;
    options: NativeStackNavigationOptions;
    back?: { title?: string };
}

const Header = <T extends Record<string, object | undefined>>(
    { navigation, route, options, back }: GenericHeaderProps<T>
) => {
    const { theme } = useTheme();
    const { width, height } = Dimensions.get('window');

    const primaryThemeColor = theme.myColors?.primary;
    const triadicThemeColor = theme.myColors?.triadic;
    const primaryFontColor = theme.fontColors?.primary;
    const scrollY = (route.params as { scrollY?: SharedValue<number> })?.scrollY;

    const title =
        typeof options.headerTitle === "function"
            ? options.title ?? route.name
            : options.headerTitle ?? options.title ?? route.name;

    const TITLE_APPEAR_SCROLL = 90;

    // Animate background color & elevation
    const animatedHeaderStyle = useAnimatedStyle(() => {
        const value = scrollY?.value ?? 0;
        const backgroundColor = interpolateColor(
            value,
            [0, TITLE_APPEAR_SCROLL],
            [triadicThemeColor ?? '', primaryThemeColor ?? '']
        );
        const elevation = interpolate(value, [0, TITLE_APPEAR_SCROLL], [0, 8], 'clamp');
        return { backgroundColor, elevation };
    });

    const animatedTitleStyle = useAnimatedStyle(() => {
        const value = scrollY?.value ?? 0;

        const opacity = interpolate(
            value,
            [TITLE_APPEAR_SCROLL - 10, TITLE_APPEAR_SCROLL + 20],
            [0, 1],
            'clamp'
        );

        const translateY = interpolate(
            value,
            [TITLE_APPEAR_SCROLL - 10, TITLE_APPEAR_SCROLL + 20],
            [8, 0],
            'clamp'
        );

        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    return (
        <Animated.View
            style={[styles.container, animatedHeaderStyle, {
                height: height * .12
            }]}
        >
            <View style={styles.contentContainer}>
                <View style={styles.headerTitleContainer}>
                    <Animated.Text
                        style={[
                            styles.headerTitle,
                            animatedTitleStyle,
                            { color: primaryFontColor },
                        ]}
                        numberOfLines={1}
                    >
                        {title}
                    </Animated.Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    backButtonContainer: {
        flex: 1,
    },
    backButton: {
        marginRight: 12,
        padding: 5,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 8,
        marginLeft: 40,
    },
    headerTitleContainer: {
        justifyContent: 'center',
        alignSelf: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 500,
        flex: 1,
        textAlignVertical: 'center',
        paddingTop: 48,
    },
    largeTitle: {
        fontSize: 32,
        fontWeight: 600,
    },
    smallTitle: {
        position: 'absolute',
        top: 10,
        left: 0,
        fontSize: 18,
        fontWeight: '600',
    },
    textInputContainer: {
        flex: 1,
        marginRight: 60,
    },
    textInput: {
        width: 150,
        height: 40,
        paddingLeft: 14,
        borderRadius: 24,
        fontSize: 12,
    },
});

const CustomHeader = (props: any) => {
    const scrollY = props.route?.params?.scrollY;
    return <Header {...props} scrollY={scrollY} />;
};

export default CustomHeader;


{/* {back ? (
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity
                            onPress={navigation.goBack}
                            style={styles.backButton}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={24}
                                color={theme.myColors?.complementary}
                            />
                        </TouchableOpacity>
                    </View>
                ) : null}
                {
                    ((!back) && title === 'Notes' || title === 'Priorities')
                        ? <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/bootsplash/priority.png')}
                                style={{ width: 32, height: 32 }}
                                resizeMode='contain'
                            />
                        </View> : null
                } */}



{/* {
                    (title === 'Notes' || title === 'Priorities')
                        ? <View style={styles.textInputContainer}>
                            <TextInput
                                value={searchItems}
                                onChangeText={(text) => setSearchItems(text)}
                                inputMode='search'
                                placeholderTextColor={theme.fontColors?.secondary}
                                placeholder='Search'
                                style={[styles.textInput, {
                                    backgroundColor: theme.colors.background,
                                    color: theme.fontColors?.primary,
                                }]}
                            />
                        </View> : null
                } */}