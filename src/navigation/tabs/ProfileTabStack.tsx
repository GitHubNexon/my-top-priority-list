import AppSettingsScreen from '../../screens/tabs/Profile/Appsettings';
import FaQScreen from '../../screens/tabs/Profile/FaQScreen';
import ProfileScreen from '../../screens/tabs/Profile/ProfileScreen';
import { ProfileTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<ProfileTabStackParamList>();

const ProfileTabStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#fff' },
                headerTitleAlign: "center",
                animation: "none",
                headerLargeTitle: false,
            }}
        >
            <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
            />
            <Stack.Screen
                name="AppSettingsScreen"
                component={AppSettingsScreen}
            />
            <Stack.Screen
                name="FaQScreen"
                component={FaQScreen}
            />
        </Stack.Navigator>
    );
};

export default ProfileTabStack;
