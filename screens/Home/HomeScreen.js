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
    ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, getDocs, setDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

import { moodCards } from '../../data/moodCards';
import { cardImages } from '../../data/cardImages';
import TarotFlipCard from '../../components/TarotFlipCard';
import { useAuth } from '../../context/AuthContext';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 2.3;

const dailyPrompts = [
    "What emotion did you ignore this week?",
    "What are you grateful for right now?",
    "What thought keeps repeating lately?",
    "How would you describe today in one word?",
];

const dailyQuotes = [
    "Today, I allow myself to feel fully and write freely.",
    "My emotions are valid, my voice matters.",
    "A calm mind brings clarity.",
    "Every entry brings me closer to understanding myself."
];

export default function HomeScreen() {
    const [card, setCard] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [moodHistory, setMoodHistory] = useState([]);
    const navigation = useNavigation();
    const { user } = useAuth();

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
                const storedMood = await AsyncStorage.getItem('selectedMood');
                const storedHistory = await AsyncStorage.getItem('moodHistory');
                if (storedMood) setSelectedMood(JSON.parse(storedMood));
                if (storedHistory) setMoodHistory(JSON.parse(storedHistory));

                const today = new Date().toISOString().split('T')[0];
                const cardRef = doc(db, 'users', user.uid, 'dailyCard', today);
                const existing = await getDoc(cardRef);

                if (existing.exists()) {
                    const data = existing.data();
                    const cardData = {
                        name: data.name,
                        meaning: data.meaning,
                        Description: data.description,
                    };
                    setCard(cardData);
                    await AsyncStorage.setItem('todaysCard', JSON.stringify(cardData));
                    console.log("📥 Loaded today's card from Firestore:", cardData);
                } else {
                    const querySnapshot = await getDocs(collection(db, 'cards'));
                    const validCards = [];
                    const skippedCards = [];

                    querySnapshot.forEach((docSnap) => {
                        const data = docSnap.data();
                        const originalName = data.name;
                        const normalizedKey = originalName.replace(/^The\s+/i, '').trim();

                        if (cardImages[normalizedKey]) {
                            console.log(`✅ Found image for: ${originalName} (key: ${normalizedKey})`);
                            validCards.push({
                                name: originalName,
                                meaning: data.meaning,
                                Description: data.description,
                            });
                        } else {
                            console.warn(`🛑 Missing image for: ${originalName} (key: ${normalizedKey})`);
                            skippedCards.push(originalName);
                        }
                    });

                    console.log(`🔍 Total cards in Firestore: ${querySnapshot.size}`);
                    console.log(`🎴 Valid cards: ${validCards.length}`);
                    console.log(`🚫 Skipped cards:`, skippedCards);

                    if (validCards.length === 0) {
                        console.warn("⚠️ No tarot cards found with matching images.");
                        return;
                    }

                    const random = validCards[Math.floor(Math.random() * validCards.length)];
                    setCard(random);
                    await AsyncStorage.setItem('todaysCard', JSON.stringify(random));

                    await setDoc(cardRef, {
                        name: random.name,
                        meaning: random.meaning,
                        description: random.Description || random.description || '',
                        savedAt: new Date(),
                    });
                    console.log("🆕 New card saved to Firestore:", random);
                }
            } catch (err) {
                console.error("❌ Error loading today's card:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleSelectMood = async (mood) => {
        setSelectedMood(mood);
        await AsyncStorage.setItem('selectedMood', JSON.stringify(mood));

        const today = new Date().toISOString().split('T')[0];
        const entry = { name: mood.name, date: today };
        const alreadyLogged = moodHistory.find((m) => m.date === today);

        if (!alreadyLogged) {
            const updated = [entry, ...moodHistory];
            setMoodHistory(updated);
            await AsyncStorage.setItem('moodHistory', JSON.stringify(updated));
        }

        navigation.navigate('JournalEntryScreen', { mood, card });
    };

    const handleWriteNow = () => {
        navigation.navigate('JournalEntryScreen', { mood: null, card });
    };

    const today = new Date().getDay();
    const quote = dailyQuotes[today % dailyQuotes.length];
    const prompt = dailyPrompts[today % dailyPrompts.length];

    const weeklyEntries = moodHistory.filter(entry => {
        const date = new Date(entry.date);
        const now = new Date();
        const diff = (now - date) / (1000 * 60 * 60 * 24);
        return diff <= 7;
    });

    const moodEmojis = {
        Happy: '😊', Sad: '😢', Angry: '😡', Love: '❤️', Disgust: '🤢',
        Joy: '😁', Peace: '🕊️', Amusement: '😄', Wanderlust: '🌍', Acceptance: '🤗',
        Desire: '🔥', Sorrow: '😭', Compassion: '💗', Hysteria: '😵', Envy: '😒',
        Contentment: '😌', Hatred: '💢', Distress: '😖', Boredom: '🥱', Awe: '😲',
        SelfPity: '😞', Adoration: '😍', Anger: '😠', Echo: '📢'
    };

    const moodFrequency = {};
    weeklyEntries.forEach(entry => {
        const moodName = typeof entry.name === 'string' ? entry.name : entry.name?.name || 'Unknown';
        moodFrequency[moodName] = (moodFrequency[moodName] || 0) + 1;
    });

    const mostCommonMood = Object.entries(moodFrequency).sort((a, b) => b[1] - a[1])[0];


    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#7da263" />
                <Text style={styles.loadingText}>Loading today's card...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.header}>Today's Card</Text>
                {card && <View style={styles.cardContainer}><TarotFlipCard card={card} /></View>}
                <Text style={styles.quote}>{quote}</Text>

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
                                    style={[styles.moodCard, { width: cardWidth }, isSelected && styles.moodCardSelected]}
                                    onPress={() => handleSelectMood(item)}
                                >
                                    <Image source={item.image} style={styles.moodImage} resizeMode="contain" />
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>

                <View style={styles.promptSection}>
                    <Text style={styles.promptLabel}>Journal Prompt</Text>
                    <Text style={styles.promptText}>{prompt}</Text>
                </View>

                <View style={styles.journalSection}>
                    <Text style={styles.journalLabel}>Journal</Text>
                    <TouchableOpacity style={styles.writeNowButton} onPress={handleWriteNow}>
                        <Text style={styles.writeNowText}>📝 Write Now</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.summarySection}>
                    <Text style={styles.summaryTitle}>This Week’s Most Felt Emotion</Text>
                    {mostCommonMood ? (
                        <Text style={styles.summaryText}>
                            {moodEmojis[mostCommonMood[0]] || '🌟'} {mostCommonMood[0]} ({mostCommonMood[1]}x this week)
                        </Text>
                    ) : (
                        <Text style={styles.summaryText}>No mood logged yet this week.</Text>
                    )}
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: 40,
        backgroundColor: '#FFF9D7',
    },
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#FFF9D7',
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
        color: '#3d5149',
        marginBottom: 20,
        marginTop: Platform.OS === 'android' ? 36 : 0,
    },
    cardContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    quote: {
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#5f5f5f',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 12,
        textAlign: 'center',
    },
    carouselSection: {
        marginTop: 12,
        marginBottom: 24,
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
        marginTop: 8,
        marginBottom: 16,
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
    journalSection: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    journalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 10,
    },
    writeNowButton: {
        backgroundColor: '#7da263',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 32,
        elevation: 4,
    },
    writeNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    promptSection: {
        marginVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#FFF8D0',
        elevation: 3,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        padding: 16,
    },
    promptLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#3d5149',
    },
    promptText: {
        fontSize: 15,
        color: '#5f5f5f',
        fontStyle: 'italic',
    },
    summarySection: {
        marginTop: 16,
        alignItems: 'center',
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 6,
    },
    summaryText: {
        fontSize: 16,
        color: '#5f5f5f',
    },
});
