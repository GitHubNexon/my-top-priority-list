import CustomHeader from '../../components/CustomHeader';
import { useTheme } from '../../hooks';
import NoteDetailsScreen from '../../screens/tabs/NotesDetailScreen';
import PrioritiesScreen from '../../screens/tabs/Priorities/PrioritiesScreen';
import { PrioritiesTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

const Stack = createNativeStackNavigator<PrioritiesTabStackParamList>();

const PrioritiesTabStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                header: CustomHeader,
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTitleAlign: 'center',
                animation: 'slide_from_right',
                headerLargeTitle: false,
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontSize: 24
                },
            }}
        >
            <Stack.Screen
                name='PrioritiesScreen'
                component={PrioritiesScreen}
                options={{
                    title: 'Priorities',
                    freezeOnBlur: false,
                }}
            />
            <Stack.Screen
                name='NoteDetailsScreen'
                component={NoteDetailsScreen}
                options={{
                    title: 'Details',
                    freezeOnBlur: true, // pause screens when blurred
                }}
            />
        </Stack.Navigator>
    );
};

export default PrioritiesTabStack;
