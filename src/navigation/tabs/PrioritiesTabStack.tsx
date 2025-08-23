import NoteDetailsScreen from '../../screens/tabs/NotesDetailScreen';
import PrioritiesScreen from '../../screens/tabs/Priorities/PrioritiesScreen';
import { PrioritiesTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<PrioritiesTabStackParamList>();

const PrioritiesTabStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#fff' },
                headerTitleAlign: "center",
                animation: "none",
                headerLargeTitle: false,
            }}
        >
            <Stack.Screen
                name="PrioritiesScreen"
                component={PrioritiesScreen}
            />
            <Stack.Screen
                name="NoteDetailsScreen"
                component={NoteDetailsScreen}
            />
        </Stack.Navigator>
    );
};

export default PrioritiesTabStack;
