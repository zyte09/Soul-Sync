// firebase/getEntries.js
import { db } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';

export const fetchMoodEntries = (user, callback) => {
    if (!user) return;
    const userId = user.uid;

    const entriesRef = ref(db, `users/${userId}/entries`);

    onValue(entriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const formatted = Object.entries(data).map(([id, entry]) => ({
                id,
                ...entry,
            }));
            callback(formatted.reverse());
        } else {
            callback([]);
        }
    });
};
