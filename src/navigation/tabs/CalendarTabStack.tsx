// src/navigation/tabs/NotesStack.tsx
import CustomHeader from '../../components/CustomHeader';
import { useTheme } from '../../hooks';
import CalendarScreen from '../../screens/tabs/Calendar/CalendarScreen';
import CurrentNotesScreen from '../../screens/tabs/Calendar/CurrentNotesScreen';
import { CalendarTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<CalendarTabStackParamList>();

const CalendarTabStack = () => {
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
                name="CalendarScreen"
                component={CalendarScreen}
                options={{
                    title: 'Calendar',
                    freezeOnBlur: false,
                }}
            />
            <Stack.Screen
                name="CurrentNotesScreen"
                component={CurrentNotesScreen}
                options={{
                    title: 'Notes',
                    freezeOnBlur: true, // pause screens when blurred
                }}
            />
        </Stack.Navigator>
    );
};

export default CalendarTabStack;
