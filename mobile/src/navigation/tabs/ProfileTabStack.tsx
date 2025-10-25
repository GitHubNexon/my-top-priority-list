import CustomHeader from '../../components/CustomHeader';
import { useTheme } from '../../hooks';
import AppSettingsScreen from '../../screens/tabs/Profile/Appsettings';
import FaQScreen from '../../screens/tabs/Profile/FaQScreen';
import ProfileScreen from '../../screens/tabs/Profile/ProfileScreen';
import { ProfileTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<ProfileTabStackParamList>();

const ProfileTabStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                header: CustomHeader,
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTitleAlign: "center",
                animation: "slide_from_right",
                headerLargeTitle: false,
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontSize: 24
                },
            }}
        >
            <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    freezeOnBlur: false,
                }}
            />
            <Stack.Screen
                name="AppSettingsScreen"
                component={AppSettingsScreen}
                options={{
                    title: 'App Settings',
                    freezeOnBlur: true, // pause screens when blurred
                }}
            />
            <Stack.Screen
                name="FaQScreen"
                component={FaQScreen}
                options={{
                    title: 'FaQ',
                    freezeOnBlur: true, // pause screens when blurred
                }}
            />
        </Stack.Navigator>
    );
};

export default ProfileTabStack;