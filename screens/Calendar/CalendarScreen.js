import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const { height } = Dimensions.get('window');

export default function CalendarScreen() {
    const [entries, setEntries] = useState({});
    const { user } = useAuth();

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
            snapshot.forEach((doc) => {
                const entry = doc.data();
                const emoji = moodEmojis[entry.mood] || '🌟';

                data[entry.date] = {
                    mood: entry.mood,
                    emoji,
                };
            });
            setEntries(data);
        };

        fetchEntries();
    }, [user]);

    const today = new Date().toISOString().split('T')[0];

    return (
        <View style={styles.container}>
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
                                    <View
                                        style={[
                                            {
                                                width: 36,
                                                height: 36,
                                                borderRadius: 18,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            },
                                            entry && { backgroundColor: '#fff4b3' },
                                            isToday && { borderWidth: 2, borderColor: '#5A4FCF' },
                                        ]}
                                    >
                                        <Text
                                            style={{
                                                color: state === 'disabled' ? '#ccc' : '#3d5149',
                                                fontWeight: entry ? 'bold' : 'normal',
                                            }}
                                        >
                                            {date.day}
                                        </Text>
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
        </View>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    innerCalendarBox: {
        borderRadius: 20,
        overflow: 'hidden',
    },
});
