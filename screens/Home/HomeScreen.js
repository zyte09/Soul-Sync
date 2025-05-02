import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Platform,
    Dimensions,
    Image,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { moodCards } from '../../data/moodCards';
import TarotFlipCard from '../../components/TarotFlipCard';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 2.3;

export default function HomeScreen() {
    const [card, setCard] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const shuffledMoodCards = useMemo(() => {
        const shuffled = [...moodCards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

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

        const today = new Date().toISOString().split('T')[0];
        const entry = { name: mood.name, date: today };

        const stored = await AsyncStorage.getItem('moodHistory');
        const history = stored ? JSON.parse(stored) : [];

        const alreadyLogged = history.find((m) => m.date === today);
        if (!alreadyLogged) {
            await AsyncStorage.setItem('moodHistory', JSON.stringify([entry, ...history]));
        }

        navigation.navigate('JournalEntryScreen');
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
                    <TarotFlipCard card={card} />
                </View>
            )}

            <View style={styles.carouselSection}>
                <Text style={styles.sectionTitle}>How are you feeling today?</Text>
                <FlatList
                    data={shuffledMoodCards}
                    keyExtractor={(item) => item.name}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    snapToInterval={cardWidth + 16}
                    renderItem={({ item }) => {
                        const isSelected = selectedMood?.name === item.name;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.moodCard,
                                    { width: cardWidth },
                                    isSelected && styles.moodCardSelected,
                                ]}
                                onPress={() => handleSelectMood(item)}
                            >
                                <Image source={item.image} style={styles.moodImage} resizeMode="contain" />
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
        marginTop: Platform.OS === 'android' ? 36 : 0,
        color: '#3d5149',
    },
    cardContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#3d5149',
    },
    carouselSection: {
        marginTop: 12,
        marginBottom: 40,
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
        height: '92%',
        borderRadius: 16,
    },
});
