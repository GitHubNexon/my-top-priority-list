// src/navigation/tabs/NotesStack.tsx
import NoteDetailsScreen from '../../screens/tabs/NoteDetailsScreen';
import NoteListScreen from '../../screens/tabs/NoteList/NoteListScreen';
import { NoteListTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<NoteListTabStackParamList>();

const NoteListTabStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="NoteListScreen"
                component={NoteListScreen}
                options={{ title: 'My Notes' }}
            />
            <Stack.Screen
                name="NoteDetailsScreen"
                component={NoteDetailsScreen}
                options={{ title: 'Note Detail' }}
            />
        </Stack.Navigator>
    );
};

export default NoteListTabStack;
