import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import {
    StatusBar,
    StyleSheet,
} from 'react-native';
import { AuthServices } from './services/AuthServices';
import { FirestoreProvider } from './context/FirestoreContext';
import { NotesProvider } from './context/NotesContext';
import { PortalProvider } from '@gorhom/portal';

export default function App() {
    useEffect(() => {
        AuthServices.initializeGoogleSDK();
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <StatusBar
                    translucent
                    backgroundColor="transparent"
                    barStyle="dark-content"
                />
                <NavigationContainer>
                    <AuthProvider>
                        <FirestoreProvider>
                            <NotesProvider>
                                <PortalProvider>
                                    <RootNavigator />
                                </PortalProvider>
                            </NotesProvider>
                        </FirestoreProvider>
                    </AuthProvider>
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});