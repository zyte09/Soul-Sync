import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { saveMoodEntry } from '../../firebase/saveEntry';

const JournalEntryScreen = ({ route, navigation }) => {
    const { mood, card } = route.params;
    const { user } = useContext(AuthContext);
    const [journalText, setJournalText] = useState('');

    const handleSave = async () => {
        if (!user) return;

        await saveMoodEntry(user, mood, card, journalText);

        navigation.navigate('Main', {
            screen: 'Vault',
        });
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.moodName, { color: '#7da263' }]}>{mood?.name}</Text>
            <Text style={styles.moodDescription}>{mood?.meaning}</Text>

            <TextInput
                style={styles.input}
                multiline
                placeholder="Write your thoughts here..."
                value={journalText}
                onChangeText={setJournalText}
                placeholderTextColor="#a1a1a1"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>

            <Text style={styles.quote}>
                “Even the softest emotions deserve to be heard.”
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Vault' })}>
                <Text style={styles.viewEntries}>View Entries →</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9D7',
        padding: 24,
    },
    moodName: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 6,
    },
    moodDescription: {
        fontSize: 15,
        color: '#5f5f5f',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fffef0',
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        height: 240,
        minHeight: 260,
        borderWidth: 1.5,
        borderColor: '#dfbb66',
        textAlignVertical: 'top',
        color: '#3d5149',
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#7da263',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        elevation: 3,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    quote: {
        marginTop: 24,
        fontSize: 14,
        color: '#5f5f5f',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    viewEntries: {
        marginTop: 12,
        textAlign: 'center',
        fontSize: 14,
        color: '#5b8f4b',
        fontWeight: 'bold',
    },
});

export default JournalEntryScreen;
