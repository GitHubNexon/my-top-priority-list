// src/navigation/tabs/NotesStack.tsx
import CalendarScreen from '../../screens/tabs/Calendar/CalendarScreen';
import CurrentNotesScreen from '../../screens/tabs/Calendar/CurrentNotesScreen';
import { CalendarTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<CalendarTabStackParamList>();

const CalendarTabStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="CalendarScreen"
                component={CalendarScreen}
                options={{ title: 'Calendar' }}
            />
            <Stack.Screen
                name="CurrentNotesScreen"
                component={CurrentNotesScreen}
                options={{ title: 'Scheduled Note' }}
            />
        </Stack.Navigator>
    );
};

export default CalendarTabStack;
