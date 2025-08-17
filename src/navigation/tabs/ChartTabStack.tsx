// src/navigation/tabs/NotesStack.tsx
import ChartScreen from '../../screens/tabs/Chart/ChartScreen';
import MoreDetailsScreen from '../../screens/tabs/Chart/MoreDetailsScreen';
import { ChartTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<ChartTabStackParamList>();

const CalendarTabStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ChartScreen"
                component={ChartScreen}
                options={{ title: 'My Stats' }}
            />
            <Stack.Screen
                name="MoreDetailsScreen"
                component={MoreDetailsScreen}
                options={{ title: 'More Detail' }}
            />
        </Stack.Navigator>
    );
};

export default CalendarTabStack;
