/* eslint-disable react-native/no-inline-styles */
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../hooks';
import Ionicons from '@react-native-vector-icons/ionicons';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useState } from 'react';

const Header = ({ navigation, route, options, back }: NativeStackHeaderProps) => {
    const { theme } = useTheme();
    const title =
        typeof options.headerTitle === "function"
            ? options.title ?? route.name 
            : options.headerTitle ?? options.title ?? route.name;

    const [searchItems, setSearchItems] = useState('')

    return (
        <View
            style={[styles.container, {
                backgroundColor: theme.myColors?.primary,
            }]}
        >
            <View style={styles.contentContainer}>
                {back ? (
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
                }
                <View style={styles.headerTitleContainer}>
                    <Text
                        style={[styles.headerTitle, {
                            color: theme.fontColors?.primary,
                            marginRight: back ? 45 : ((!back) && title === 'Notes'
                                || title === 'Priorities') ? 0 : 0,
                        }]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                </View>
                {
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
                }
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingTop: 50,
        elevation: 4,
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        flex: 1,
        textAlignVertical: 'center',
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

const CustomHeader = (props: NativeStackHeaderProps) => <Header {...props} />

export default CustomHeader;