import { PrioritiesTabStackParamList } from '../../../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text
} from 'react-native';

type Props = NativeStackScreenProps<PrioritiesTabStackParamList, 'NoteDetails'>;

const MoreDetailsScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Note Title</Text>
            <Text style={styles.content}>Note content...</Text>
        </ScrollView>
    );
};

export default MoreDetailsScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    content: {
        fontSize: 16,
        lineHeight: 22,
    },
});
