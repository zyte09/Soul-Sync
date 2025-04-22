import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message'; // ✅ Add this

export default function ProfileScreen() {
    const { user, setUser } = useContext(AuthContext);

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            setUser(null);

                            Toast.show({
                                type: 'success',
                                text1: 'Signed out successfully 👋',
                                position: 'top',
                                visibilityTime: 2000,
                                topOffset: 80
                            });
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Logout Failed',
                                text2: error.message,
                                position: 'top',
                                visibilityTime: 2500,
                                topOffset: 80
                            });
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.label}>Logged in as:</Text>
            <Text style={styles.email}>{user?.email || 'Unknown user'}</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 16, color: '#555' },
    email: { fontSize: 16, color: '#333', marginBottom: 40 },
    logoutButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 8
    },
    logoutText: { color: '#fff', fontSize: 16, fontWeight: '500' }
});
