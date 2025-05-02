import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { moodCards } from '../../data/moodCards';

export default function MoodSelectionScreen() {
    const navigation = useNavigation();

    const handleMoodSelect = async (mood) => {
        await AsyncStorage.setItem('selectedMood', JSON.stringify(mood));
        navigation.navigate('JournalEntryScreen'); // 👈 go to Journal after selection
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>How are you feeling today?</Text>
            <FlatList
                data={moodCards}
                keyExtractor={(item) => item.name}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.moodCard}
                        onPress={() => handleMoodSelect(item)}
                    >
                        <Image
                            source={item.image}
                            style={styles.moodImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.moodLabel}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9D7',
        paddingTop: 48,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#3d5149',
        marginBottom: 24,
    },
    moodCard: {
        marginRight: 16,
        alignItems: 'center',
    },
    moodImage: {
        width: 100,
        height: 100,
        marginBottom: 8,
    },
    moodLabel: {
        fontSize: 16,
        color: '#3d5149',
        fontWeight: '500',
    },
});
