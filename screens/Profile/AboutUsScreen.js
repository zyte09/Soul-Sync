import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutUsScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>About Soul Sync</Text>

            <Text style={styles.paragraph}>
                Soul Sync is a gentle space for self-awareness and reflection.
            </Text>

            <Text style={styles.paragraph}>
                This app helps you tune into your emotions, document your thoughts, and track your moods over time—so you can understand yourself on a deeper level.
            </Text>

            <Text style={styles.paragraph}>
                Whether you're journaling in the moment or looking back on your emotional journey, Soul Sync provides a safe, intuitive, and calming experience.
            </Text>

            <Text style={styles.paragraph}>
                Thank you for allowing Soul Sync to be part of your personal growth.
            </Text>

            <Text style={styles.signature}>
                With love,{'\n'}
                <Text style={styles.italic}>The Soul Sync Team</Text>
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFF9D7',
        paddingVertical: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 20,
        textAlign: 'center',
    },
    paragraph: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 24,
    },
    signature: {
        marginTop: 20,
        fontSize: 16,
        color: '#6c8f45',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    italic: {
        fontStyle: 'italic',
    },
});
