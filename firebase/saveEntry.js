// firebase/saveEntry.js
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const saveMoodEntry = async (user, mood, card, journalText) => {
    if (!user) return;

    try {
        const dateString = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

        const entriesRef = collection(db, 'users', user.uid, 'entries');
        await addDoc(entriesRef, {
            mood,
            card,
            journal: journalText || '',
            date: dateString,
            timestamp: serverTimestamp(),
        });

        console.log('✅ Mood entry saved to Firestore!');
    } catch (error) {
        console.error('❌ Error saving mood entry:', error);
    }
};
