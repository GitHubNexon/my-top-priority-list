import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { AlarmService } from '../../../services/AlarmServices';

const FaQScreen = () => {

    const setAlarm = async () => {
        await AlarmService.scheduleAlarm({
            timestamp: Date.now() + 5000, // 5 sec later
            title: "My Custom Alarm",
            message: "This is a dynamic message!",
            recurrenceType: "ONCE",
        });
        console.log("Alarm scheduled ✅");
    };

    const cancelAlarm = async () => {
        console.log(`Alarm canceled ❌`);
        return
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Frequently Asked Questions</Text>

            <View style={styles.qaBlock}>
                <Text style={styles.question}>Q: How to use this app?</Text>
                <Text style={styles.answer}>
                    A: Simply navigate through the menu and select your desired feature.
                </Text>
            </View>

            <View style={styles.qaBlock}>
                <Text style={styles.question}>Q: Can I save notes offline?</Text>
                <Text style={styles.answer}>
                    A: Yes, notes are saved locally and synced when online.
                </Text>
            </View>

            <View style={styles.qaBlock}>
                <Text style={styles.question}>Q: How do I change the theme?</Text>
                <Text style={styles.answer}>
                    A: Go to App Settings and toggle the Dark Mode switch.
                </Text>
            </View>
            <Pressable onPress={setAlarm} style={styles.saveButton}>
                <Text style={styles.buttonText}>Set Alarm</Text>
            </Pressable>
            <Pressable onPress={cancelAlarm} style={styles.saveButton}>
                <Text style={styles.buttonText}>Cancel Alarm</Text>
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    qaBlock: {
        marginBottom: 20,
    },
    question: {
        fontWeight: '600',
        fontSize: 18,
        marginBottom: 6,
    },
    answer: {
        fontSize: 16,
        color: '#555',
    },
    saveButton: {
        width: 150,
        height: 50,
        marginTop: 30,
        marginBottom: 30,
        borderRadius: 30,
        backgroundColor: '#CFFFDC',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 20,
    },
});

export default FaQScreen;
