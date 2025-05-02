// screens/Vault/CardVaultScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fetchMoodEntries } from '../../firebase/getEntries';

export default function CardVaultScreen() {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        fetchMoodEntries('guest-user', setEntries);
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.mood}>{item.mood.toUpperCase()}</Text>
            <Text style={styles.title}>{item.card.title}</Text>
            <Text style={styles.message}>{item.card.message}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Your Mood Journal</Text>
            <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    heading: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
    card: {
        backgroundColor: '#f6f6f6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12
    },
    mood: { fontSize: 14, fontWeight: 'bold', color: '#555' },
    title: { fontSize: 18, fontWeight: '600', marginTop: 6 },
    message: { fontSize: 15, marginTop: 4, color: '#444' },
    timestamp: { fontSize: 12, color: '#888', marginTop: 8 }
});
