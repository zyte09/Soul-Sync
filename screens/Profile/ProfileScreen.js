import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

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
                            });
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Logout Failed',
                                text2: error.message,
                                position: 'top',
                                visibilityTime: 2500,
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
            <Text style={styles.title}>Your Profile</Text>
            <Text style={styles.label}>Logged in as:</Text>
            <Text style={styles.email}>{user?.email || 'Unknown user'}</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9D7',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        color: '#5f5f5f',
    },
    email: {
        fontSize: 16,
        fontWeight: '500',
        color: '#3d5149',
        marginBottom: 40,
    },
    logoutButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        elevation: 3,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
