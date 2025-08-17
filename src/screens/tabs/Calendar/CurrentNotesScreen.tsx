import { PrioritiesTabStackParamList } from '../../../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

type Props = NativeStackScreenProps<PrioritiesTabStackParamList, 'NoteDetails'>;

const CurrentNotesScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Note Title</Text>
            <Text style={styles.content}>Note content...</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 12,
    },
    content: {
        fontSize: 18,
        lineHeight: 24,
        color: '#333',
    },
});

export default CurrentNotesScreen;
