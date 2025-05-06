import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function CalendarScreen() {
    const [entries, setEntries] = useState({});
    const [weeklyMoodCounts, setWeeklyMoodCounts] = useState({});
    const { user } = useAuth();

    const filterOptions = ['Top 5', 'Top 10', 'All'];
    const [filter, setFilter] = useState('All');

    const handleToggleFilter = () => {
        const currentIndex = filterOptions.indexOf(filter);
        const nextIndex = (currentIndex + 1) % filterOptions.length;
        setFilter(filterOptions[nextIndex]);
    };

    const moodEmojis = {
        Happy: '😊', Sad: '😢', Angry: '😡', Love: '❤️', Disgust: '🤢',
        Joy: '😁', Peace: '🕊️', Amusement: '😄', Wanderlust: '🌍', Acceptance: '🤗',
        Desire: '🔥', Sorrow: '😭', Compassion: '💗', Hysteria: '😵', Envy: '😒',
        Contentment: '😌', Hatred: '💢', Distress: '😖', Boredom: '🥱', Awe: '😲',
        SelfPity: '😞', Adoration: '😍', Anger: '😠', Echo: '📢'
    };

    useEffect(() => {
        const fetchEntries = async () => {
            const snapshot = await getDocs(collection(db, `users/${user.uid}/entries`));
            const data = {};
            const moodCounter = {};
            const now = new Date();

            snapshot.forEach((doc) => {
                const entry = doc.data();
                const date = new Date(entry.date);
                const diff = (now - date) / (1000 * 60 * 60 * 24);

                const moodName = typeof entry.mood === 'string'
                    ? entry.mood
                    : entry.mood?.name || 'Unknown';
                const emoji = moodEmojis[moodName] || '🌟';

                data[entry.date] = {
                    mood: moodName,
                    emoji,
                };

                if (diff <= 7) {
                    const key = `${emoji} ${moodName}`;
                    moodCounter[key] = (moodCounter[key] || 0) + 1;
                }
            });

            setEntries(data);
            setWeeklyMoodCounts(moodCounter);
        };

        fetchEntries();
    }, [user]);

    const today = new Date().toISOString().split('T')[0];

    let sortedMoodEntries = Object.entries(weeklyMoodCounts).sort((a, b) => b[1] - a[1]);
    if (filter === 'Top 5') sortedMoodEntries = sortedMoodEntries.slice(0, 5);
    if (filter === 'Top 10') sortedMoodEntries = sortedMoodEntries.slice(0, 10);

    const pairedEntries = [];
    for (let i = 0; i < sortedMoodEntries.length; i += 2) {
        pairedEntries.push([sortedMoodEntries[i], sortedMoodEntries[i + 1] || null]);
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.title}>Mood Calendar</Text>

            <View style={styles.calendarBox}>
                <View style={styles.innerCalendarBox}>
                    <Calendar
                        markingType="custom"
                        dayComponent={({ date, state }) => {
                            const entry = entries[date.dateString];
                            const isToday = date.dateString === today;

                            return (
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={[
                                        styles.dateCircle,
                                        entry && { backgroundColor: '#fff4b3' },
                                        isToday && { borderWidth: 2, borderColor: '#5A4FCF' },
                                    ]}>
                                        <Text style={{
                                            color: state === 'disabled' ? '#ccc' : '#3d5149',
                                            fontWeight: entry ? 'bold' : 'normal',
                                        }}>{date.day}</Text>
                                    </View>
                                    {entry?.emoji && (
                                        <Text style={{ fontSize: 14, marginTop: 2 }}>{entry.emoji}</Text>
                                    )}
                                </View>
                            );
                        }}
                        theme={{
                            backgroundColor: '#FFF9D7',
                            calendarBackground: '#FFF9D7',
                            arrowColor: '#5A4FCF',
                            todayTextColor: '#5A4FCF',
                            textDayFontSize: 16,
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 14,
                            dayTextColor: '#3d5149',
                            monthTextColor: '#3d5149',
                        }}
                    />
                </View>
            </View>

            <View style={styles.weeklySummary}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.sectionTitle}>This Week's Mood Summary</Text>
                    <TouchableOpacity onPress={handleToggleFilter} style={styles.filterButton}>
                        <Ionicons name="funnel-outline" size={20} color="#3d5149" />
                        <Text style={styles.filterText}>{filter}</Text>
                    </TouchableOpacity>
                </View>

                {sortedMoodEntries.length === 0 ? (
                    <Text style={styles.emptyText}>No moods logged this week.</Text>
                ) : (
                    pairedEntries.map((row, index) => {
                        const [first, second] = row || [];
                        return (
                            <View key={index} style={styles.row}>
                                {first && (
                                    <Text style={styles.emojiItem}>
                                        {first[0]} × {first[1]}
                                    </Text>
                                )}
                                {second && (
                                    <Text style={styles.emojiItem}>
                                        {second[0]} × {second[1]}
                                    </Text>
                                )}
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9D7',
        paddingHorizontal: 16,
        paddingTop: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#3d5149',
        marginBottom: 16,
    },
    calendarBox: {
        padding: 4,
        backgroundColor: '#fffef0',
        borderRadius: 24,
        elevation: 5,
    },
    innerCalendarBox: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    dateCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weeklySummary: {
        marginTop: 24,
        backgroundColor: '#fff3c4',
        borderRadius: 16,
        padding: 16,
        elevation: 3,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3d5149',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    emojiItem: {
        fontSize: 18,
        color: '#3d5149',
        width: '48%',
    },
    emptyText: {
        fontStyle: 'italic',
        color: '#6c6c6c',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2eecb',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    filterText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#3d5149',
        fontWeight: '600',
    },
});
