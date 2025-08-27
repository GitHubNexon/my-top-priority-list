// src/navigation/tabs/NotesStack.tsx
import NotesDetailScreen from '../../screens/tabs/NotesDetailScreen';
import NotesScreen from '../../screens/tabs/Notes/NotesScreen';
import { NotesTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<NotesTabStackParamList>();

const NotesTabStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                //headerStyle: { backgroundColor: '#fff' },
                //headerTitleAlign: "center",
                animation: "none",
                //headerLargeTitle: false,
            }}
        >
            <Stack.Screen
                name="NotesScreen"
                component={NotesScreen}
            />
            <Stack.Screen
                name="NotesDetailScreen"
                component={NotesDetailScreen}
            />
        </Stack.Navigator>
    );
};

export default NotesTabStack;
