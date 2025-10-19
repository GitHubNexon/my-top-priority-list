import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    AuthProvider,
    FirestoreProvider,
    NotesProvider,
    ThemeProvider
} from './context';
import RootNavigator from './navigation/RootNavigator';
import { StyleSheet } from 'react-native';
import { AuthServices } from './services/AuthServices';
import { PortalProvider } from '@gorhom/portal';
import { SystemBars } from 'react-native-edge-to-edge';
import {
    isReadyRef,
    navigate,
    navigationRef,
    pendingNavigation
} from './hooks/useNavigation';
import notifee, { EventType } from '@notifee/react-native';
import { NavigationTypeProvider } from './context';
import { useTheme } from './hooks';
import { AlarmService } from './services/AlarmServices';
import AlarmConfigProvider from './context/AlarmConfigContext';
import AlarmProvider from './context/AlarmContext';

export default function App() {
    const { theme } = useTheme();
    const alarm = new AlarmService;

    useEffect(() => {
        AuthServices.initializeGoogleSDK();
        alarm.requestNotificationPermission();
        //const notifeePermission = async () => await notifee.requestPermission();

        //notifeePermission();
    }, []);

    useEffect(() => {
        return () => { isReadyRef.current = false; };
    }, []);

    /**
     * Going into specific tab
     * when app is minimized are
     * not working !!!!!!!!
     */
    useEffect(() => {
        const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
                const noteType = String(detail.notification?.data?.noteType);

                if (noteType === 'Priority') {
                    navigationRef.current?.navigate('Main', {
                        screen: 'Priorities',
                        params: {
                            screen: 'PrioritiesScreen',
                        },
                    });
                } else {
                    navigationRef.current?.navigate('Main', {
                        screen: 'Notes',
                        params: {
                            screen: 'NotesScreen',
                        },
                    });
                }
            }

            if (EventType.ACTION_PRESS && detail.pressAction?.id === 'stop') {
                notifee.cancelNotification(detail.notification?.id || '');
            }
        });

        /**
         * Can't make a one function call for navigation
         * because....
         * @onForegroundEvent and
         * @getInitialNotification
         * has a different navigation
         */
        notifee.getInitialNotification().then(notification => {
            if (notification) {
                const noteType = String(notification.notification.data?.noteType);

                if (noteType === 'Priority') {
                    navigate('Main', {
                        screen: 'Priorities',
                        params: {
                            screen: 'PrioritiesScreen',
                        },
                    });
                } else {
                    navigate('Main', {
                        screen: 'Notes',
                        params: {
                            screen: 'NotesScreen',
                        },
                    });
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <ThemeProvider>
                <SafeAreaProvider>
                    <SystemBars style='auto' />
                    <NavigationContainer
                        theme={theme}
                        ref={navigationRef}
                        onReady={() => {
                            isReadyRef.current = true;
                            pendingNavigation.forEach(fn => fn());
                            pendingNavigation.length = 0;
                        }}
                    >
                        <NavigationTypeProvider>
                            <AuthProvider>
                                <FirestoreProvider>
                                    <AlarmConfigProvider>
                                        <AlarmProvider>
                                            <NotesProvider>
                                                <PortalProvider>
                                                    <RootNavigator />
                                                </PortalProvider>
                                            </NotesProvider>
                                        </AlarmProvider>
                                    </AlarmConfigProvider>
                                </FirestoreProvider>
                            </AuthProvider>
                        </NavigationTypeProvider>
                    </NavigationContainer>
                </SafeAreaProvider>
            </ThemeProvider>
        </GestureHandlerRootView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});