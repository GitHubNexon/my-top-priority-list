import NotesDetailScreen from '../../screens/tabs/NotesDetailScreen';
import NotesScreen from '../../screens/tabs/Notes/NotesScreen';
import { NotesTabStackParamList } from '../../types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from '../../hooks';
import CustomHeader from '../../components/CustomHeader';

const Stack = createNativeStackNavigator<NotesTabStackParamList>();

const NotesTabStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                header: CustomHeader,
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTitleAlign: 'left',
                animation: 'slide_from_right',
                headerLargeTitle: false,
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontSize: 24
                },
            }}
        >
            <Stack.Screen
                name='NotesScreen'
                component={NotesScreen}
                options={{
                    title: 'Notes',
                    freezeOnBlur: false,
                }}
            />
            <Stack.Screen
                name='NotesDetailScreen'
                component={NotesDetailScreen}
                options={{
                    title: 'Details',
                    freezeOnBlur: true, // pause screens when blurred
                }}
            />
        </Stack.Navigator>
    );
};

export default NotesTabStack;
