import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

const AppSettingsScreen: React.FC = () => {
    const [isEnabled, setIsEnabled] = React.useState(false);

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>App Settings</Text>
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>Enable Notifications</Text>
                <Switch value={isEnabled} onValueChange={toggleSwitch} />
            </View>
            <View style={styles.settingRow}>
                <Text style={styles.settingText}>Dark Mode</Text>
                <Switch value={false} onValueChange={() => { }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingText: { fontSize: 18 },
});

export default AppSettingsScreen;
