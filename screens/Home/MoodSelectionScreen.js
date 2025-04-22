import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import CardModal from '../../components/CardModal';
import { AuthContext } from '../../context/AuthContext';
import { saveMoodEntry } from '../../firebase/saveEntry';

const MOODS = ['happy', 'anxious', 'calm', 'sad', 'tired'];

const CARD_MESSAGES = {
    happy: { title: 'The Sunbeam', message: 'Let your joy warm others today.' },
    anxious: { title: 'The Anchor', message: 'Ground yourself. Breathe.' },
    calm: { title: 'The Mirror', message: 'Reflect on your peace. It’s a gift.' },
    sad: { title: 'The Rainfall', message: 'Feel it. Then let it pass through.' },
    tired: { title: 'The Ember', message: 'Rest, but keep the flame alive.' },
};

export default function MoodSelectionScreen() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [showCard, setShowCard] = useState(false);
    const { user } = useContext(AuthContext);

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood);
        setShowCard(true);
    };

    const handleSave = async () => {
        if (!user || !selectedMood) return;
        const card = CARD_MESSAGES[selectedMood];
        await saveMoodEntry(user, selectedMood, card, '');
        setShowCard(false);
        setSelectedMood(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>How are you feeling today?</Text>
            <View style={styles.moodContainer}>
                {MOODS.map((mood) => (
                    <TouchableOpacity
                        key={mood}
                        style={styles.moodButton}
                        onPress={() => handleMoodSelect(mood)}
                    >
                        <Text style={styles.moodText}>{mood}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Modal visible={showCard} transparent={true} animationType="slide">
                <CardModal
                    mood={selectedMood}
                    card={CARD_MESSAGES[selectedMood]}
                    onClose={() => setShowCard(false)}
                    onSave={handleSave}
                />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    heading: { fontSize: 22, fontWeight: '600', marginBottom: 30 },
    moodContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    moodButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 15,
        margin: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    moodText: { fontSize: 16 }
});
