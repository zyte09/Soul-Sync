// components/CardModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function CardModal({ mood, card, onClose, onSave }) {
    return (
        <View style={styles.overlay}>
            <View style={styles.modal}>
                <Text style={styles.title}>{card.title}</Text>
                <Text style={styles.message}>{card.message}</Text>

                <TouchableOpacity style={styles.button} onPress={onSave}>
                    <Text style={styles.buttonText}>Save Entry</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
                    <Text style={{ color: '#888' }}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' },
    modal: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center'
    },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    message: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
    button: {
        backgroundColor: '#5A4FCF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10
    },
    buttonText: { color: '#fff', fontSize: 16 }
});
