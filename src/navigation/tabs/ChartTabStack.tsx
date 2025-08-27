// src/navigation/tabs/NotesStack.tsx
import ChartScreen from '../../screens/tabs/Chart/ChartScreen';
import MoreDetailsScreen from '../../screens/tabs/Chart/MoreDetailsScreen';
import { ChartTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<ChartTabStackParamList>();

const CalendarTabStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                // headerStyle: { backgroundColor: '#fff' },
                // headerTitleAlign: "center",
                animation: "none",
                // headerLargeTitle: false,
            }}
        >
            <Stack.Screen
                name="ChartScreen"
                component={ChartScreen}
            />
            <Stack.Screen
                name="MoreDetailsScreen"
                component={MoreDetailsScreen}
            />
        </Stack.Navigator>
    );
};

export default CalendarTabStack;
