import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text
} from 'react-native';
import { useTheme } from '../../hooks';

const NotesDetailScreen = () => {
    const { theme } = useTheme();
    const themeColor = theme.colors.background;

    return (
        <ScrollView contentContainerStyle={[styles.container, {
            backgroundColor: themeColor,
        }]}>
            <Text style={styles.title}>Note Title</Text>
            <Text style={styles.content}>Note content...</Text>
        </ScrollView>
    );
};


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

export default NotesDetailScreen;