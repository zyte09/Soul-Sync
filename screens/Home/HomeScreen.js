import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moodCards } from '../../data/moodCards';

export default function HomeScreen() {
    const [card, setCard] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedCard = await AsyncStorage.getItem('todaysCard');
                const storedMood = await AsyncStorage.getItem('selectedMood');
                if (storedCard) setCard(JSON.parse(storedCard));
                if (storedMood) setSelectedMood(JSON.parse(storedMood));
                if (!storedCard) {
                    const random = moodCards[Math.floor(Math.random() * moodCards.length)];
                    setCard(random);
                    await AsyncStorage.setItem('todaysCard', JSON.stringify(random));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSelectMood = async (mood) => {
        setSelectedMood(mood);
        await AsyncStorage.setItem('selectedMood', JSON.stringify(mood));
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#7da263" />
                <Text style={styles.loadingText}>Shuffling cards...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Today's Card</Text>

            {card && (
                <View style={styles.cardContainer}>
                    <Image
                        source={card.image}
                        style={styles.cardImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardMeaning}>{card.meaning}</Text>
                </View>
            )}

            <View style={styles.carouselSection}>
                <Text style={styles.sectionTitle}>How are you feeling today?</Text>
                <FlatList
                    data={moodCards}
                    keyExtractor={(item) => item.name}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    renderItem={({ item }) => {
                        const isSelected = selectedMood?.name === item.name;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.moodCard,
                                    isSelected && styles.moodCardSelected,
                                ]}
                                onPress={() => handleSelectMood(item)}
                            >
                                <Image
                                    source={item.image}
                                    style={styles.moodImage}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#FFF9D7',
        justifyContent: 'flex-start',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF9D7',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#3d5149',
    },
    cardContainer: {
        borderWidth: 2,
        borderColor: '#dfbb66',
        borderRadius: 20,
        backgroundColor: '#fffef0',
        padding: 24,
        marginBottom: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 5,
    },
    cardImage: {
        width: 140,
        height: 140,
        marginBottom: 16,
    },
    cardName: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#7da263',
        marginBottom: 8,
    },
    cardMeaning: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        color: '#3d5149',
        marginBottom: 8,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#3d5149',
    },
    // Mood Carousel
    carouselSection: {
        marginTop: 12,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 12,
        textAlign: 'center',
    },
    moodCard: {
        marginRight: 16,
        width: 140,
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#FFF8D0',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        padding: 8,
        marginBottom: 16,
        marginTop: 8,
    },
    moodCardSelected: {
        elevation: 6,
        shadowColor: '#7da263',
        transform: [{ scale: 1.05 }],
        backgroundColor: '#FFF8D0',
    },
    moodImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
});
