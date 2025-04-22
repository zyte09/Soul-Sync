// firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: 'AIzaSyD6Jf8T-ZSKUlE_fnF6Q5uKt_e4W8O9N58',
    authDomain: 'soul-sync-9add2.firebaseapp.com',
    databaseURL: 'https://soul-sync-9add2-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'soul-sync-9add2',
    storageBucket: 'soul-sync-9add2.appspot.com',
    messagingSenderId: '549729863114',
    appId: '1:549729863114:web:8ee1790c10cdfcde3ebb33'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Set up auth with persistence
import { getAuth } from 'firebase/auth';
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export { app, db, auth };
