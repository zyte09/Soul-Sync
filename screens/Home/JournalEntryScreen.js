import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function JournalEntryScreen() {
    const [entry, setEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const getMood = async () => {
            const stored = await AsyncStorage.getItem('selectedMood');
            if (stored) setSelectedMood(JSON.parse(stored));
        };
        getMood();
    }, []);

    const saveEntry = async () => {
        const today = new Date().toISOString().split('T')[0];
        const journalEntry = { mood: selectedMood?.name, date: today, entry };

        const stored = await AsyncStorage.getItem('journalEntries');
        const allEntries = stored ? JSON.parse(stored) : [];

        await AsyncStorage.setItem(
            'journalEntries',
            JSON.stringify([journalEntry, ...allEntries])
        );

        setEntry('');

        Alert.alert('Saved', 'Your journal entry has been saved.', [
            {
                text: 'OK',
                onPress: () => navigation.navigate('Main', { screen: 'Home' }),
            },
        ]);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>{selectedMood?.name}</Text>
                <Text style={styles.subtitle}>{selectedMood?.meaning}</Text>

                <TextInput
                    style={styles.input}
                    multiline
                    placeholder="Write your thoughts here..."
                    value={entry}
                    onChangeText={setEntry}
                />

                <TouchableOpacity style={styles.button} onPress={saveEntry}>
                    <Text style={styles.buttonText}>Save Entry</Text>
                </TouchableOpacity>

                <Text style={styles.quote}>
                    “Even the softest emotions deserve to be heard.”
                </Text>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Vault')}
                    style={styles.linkContainer}
                >
                    <Text style={styles.link}>View Entries →</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF9D7',
        padding: 24,
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#7da263',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#3d5149',
        marginBottom: 24,
    },
    input: {
        height: 240,
        backgroundColor: '#fffef0',
        padding: 16,
        borderRadius: 16,
        textAlignVertical: 'top',
        fontSize: 16,
        color: '#3d5149',
        borderColor: '#dfbb66',
        borderWidth: 1,
    },
    button: {
        marginTop: 24,
        backgroundColor: '#7da263',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fffef0',
        fontSize: 16,
        fontWeight: 'bold',
    },
    quote: {
        marginTop: 24,
        fontStyle: 'italic',
        color: '#555',
        fontSize: 14,
        textAlign: 'center',
    },
    linkContainer: {
        marginTop: 12,
        alignItems: 'center',
    },
    link: {
        color: '#5b8f4b',
        fontWeight: '600',
    },
});
