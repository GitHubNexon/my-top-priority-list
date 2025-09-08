// src/navigation/tabs/NotesStack.tsx
import CustomHeader from '../../components/CustomHeader';
import { useTheme } from '../../hooks';
import ChartScreen from '../../screens/tabs/Chart/ChartScreen';
import MoreDetailsScreen from '../../screens/tabs/Chart/MoreDetailsScreen';
import { ChartTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<ChartTabStackParamList>();

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
                name="ChartScreen"
                component={ChartScreen}
                options={{
                    title: 'Chart',
                    freezeOnBlur: false,
                }}
            />
            <Stack.Screen
                name="MoreDetailsScreen"
                component={MoreDetailsScreen}
                options={{
                    title: 'Details',
                    freezeOnBlur: true, // pause screens when blurred
                }}
            />
        </Stack.Navigator>
    );
};

export default CalendarTabStack;
