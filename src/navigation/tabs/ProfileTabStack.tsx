import AppSettingsScreen from '../../screens/tabs/Profile/Appsettings';
import FaQScreen from '../../screens/tabs/Profile/FaQScreen';
import ProfileScreen from '../../screens/tabs/Profile/ProfileScreen';
import { ProfileTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<ProfileTabStackParamList>();

const ProfileTabStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{ title: 'My Profile' }}
            />
            <Stack.Screen
                name="AppSettingsScreen"
                component={AppSettingsScreen}
                options={{ title: 'App Settings' }}
            />
            <Stack.Screen
                name="FaQScreen"
                component={FaQScreen}
                options={{ title: 'FaQ' }}
            />
        </Stack.Navigator>
    );
};

export default ProfileTabStack;
