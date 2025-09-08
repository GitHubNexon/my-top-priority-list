import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
    const { isLoggedIn, isReady } = useAuth();

    if (!isReady) {
        return null;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                freezeOnBlur: false,
            }}
        >
            {isLoggedIn ? (
                <Stack.Screen name="Main" component={BottomTabNavigator} />
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;