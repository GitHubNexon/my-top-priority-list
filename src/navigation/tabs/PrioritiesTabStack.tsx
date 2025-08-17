import NoteDetailsScreen from '../../screens/tabs/NoteDetailsScreen';
import PrioritiesScreen from '../../screens/tabs/Priorities/PrioritiesScreen';
import { PrioritiesTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<PrioritiesTabStackParamList>();

const PrioritiesTabStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="PrioritiesScreen"
                component={PrioritiesScreen}
                options={{ title: 'My Priorities' }}
            />
            <Stack.Screen
                name="NoteDetailsScreen"
                component={NoteDetailsScreen}
                options={{ title: 'Note Detail' }}
            />
        </Stack.Navigator>
    );
};

export default PrioritiesTabStack;
