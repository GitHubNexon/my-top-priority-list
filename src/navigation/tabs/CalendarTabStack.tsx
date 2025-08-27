// src/navigation/tabs/NotesStack.tsx
import CalendarScreen from '../../screens/tabs/Calendar/CalendarScreen';
import CurrentNotesScreen from '../../screens/tabs/Calendar/CurrentNotesScreen';
import { CalendarTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<CalendarTabStackParamList>();

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
                name="CalendarScreen"
                component={CalendarScreen}
            />
            <Stack.Screen
                name="CurrentNotesScreen"
                component={CurrentNotesScreen}
            />
        </Stack.Navigator>
    );
};

export default CalendarTabStack;
