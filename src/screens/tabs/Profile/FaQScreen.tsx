import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FaQScreen = () => {
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
});

export default FaQScreen;
