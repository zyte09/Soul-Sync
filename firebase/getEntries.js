import { db } from './firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const fetchMoodEntries = (user, callback) => {
    if (!user) return;
    const userId = user.uid;

    const entriesRef = collection(db, 'users', userId, 'entries');
    const q = query(entriesRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const entries = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(entries);
    });
};
