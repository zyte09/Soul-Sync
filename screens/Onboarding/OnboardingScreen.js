// screens/Onboarding/OnboardingScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function OnboardingScreen({ onFinish }) {
    return (
        <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.container}
        >
            <View style={styles.page}>
                <Text style={styles.title}>Welcome to Soul Sync</Text>
                <Text style={styles.text}>A calming mood journal with tarot-inspired prompts.</Text>
            </View>
            <View style={styles.page}>
                <Text style={styles.title}>Check In Once a Day</Text>
                <Text style={styles.text}>Pick your mood and reflect with a gentle card.</Text>
            </View>
            <View style={styles.page}>
                <Text style={styles.title}>Start Syncing</Text>
                <Text style={styles.text}>Ready to connect with yourself?</Text>
                <TouchableOpacity style={styles.button} onPress={onFinish}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    page: {
        width: 360, // for iPhone sizing — adjust as needed
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30
    },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    text: { fontSize: 16, textAlign: 'center' },
    button: {
        marginTop: 20,
        backgroundColor: '#5A4FCF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10
    },
    buttonText: { color: '#fff', fontSize: 16 }
});
