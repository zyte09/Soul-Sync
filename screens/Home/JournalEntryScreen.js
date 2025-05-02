import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Vibration,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { saveMoodEntry } from '../../firebase/saveEntry';

const JournalEntryScreen = ({ route, navigation }) => {
    const { mood, card } = route.params;
    const { user } = useContext(AuthContext);
    const [journalText, setJournalText] = useState('');
    const [showModal, setShowModal] = useState(false);

    const isFreeWrite = !mood;

    const handleSave = async () => {
        if (!user) return;

        await saveMoodEntry(user, mood, card, journalText);

        Vibration.vibrate(100); // ✅ trigger success vibration
        setShowModal(true);

        setTimeout(() => {
            setShowModal(false);
            navigation.navigate('Main', { screen: 'Vault' });
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.titleText,
                    { color: '#7da263' },
                    isFreeWrite && styles.journalTitleSpacing,
                ]}
            >
                {isFreeWrite ? 'Journal' : mood.name}
            </Text>

            {!isFreeWrite && (
                <Text style={styles.moodDescription}>{mood.meaning}</Text>
            )}

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
            <TouchableOpacity
                onPress={() => navigation.navigate('Main', { screen: 'Vault' })}
            >
                <Text style={styles.viewEntries}>View Entries →</Text>
            </TouchableOpacity>

            {showModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalEmoji}>✅</Text>
                        <Text style={styles.modalText}>Entry Saved!</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9D7',
        padding: 24,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    journalTitleSpacing: {
        marginBottom: 20,
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
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    modalBox: {
        backgroundColor: '#FFFDF0',
        padding: 24,
        borderRadius: 20,
        width: '75%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 6,
    },
    modalEmoji: {
        fontSize: 36,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d5149',
        textAlign: 'center',
    },
});

export default JournalEntryScreen;
