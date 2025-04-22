// firebase/saveEntry.js
import { db } from './firebaseConfig';
import { ref, push, set } from 'firebase/database';

export const saveMoodEntry = async (user, mood, card, journalText) => {
    if (!user) return;
    const userId = user.uid;

    try {
        const entryRef = ref(db, `users/${userId}/entries`);
        const newEntryRef = push(entryRef);

        await set(newEntryRef, {
            mood,
            card,
            journal: journalText || '',
            timestamp: new Date().toISOString()
        });

        console.log('Mood entry saved!');
    } catch (error) {
        console.error('Save error:', error);
    }
};
