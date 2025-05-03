import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
    const { user, setUser } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.photoURL) setProfileImage(data.photoURL);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
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
                style: 'destructive',
            },
        ]);
    };

    const pickImage = async () => {
        console.log('🟢 pickImage called');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Permission to access media library is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setProfileImage(uri);
            await uploadImage(uri);
        }

        console.log('ImagePicker result:', result);
    };

    const uploadImage = async (uri) => {
        try {
            setLoading(true);

            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const byteCharacters = atob(base64);
            const byteArrays = [];

            for (let i = 0; i < byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i));
            }

            const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });
            const imageRef = ref(storage, `profileImages/${user.uid}`);
            await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(imageRef);

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                photoURL: downloadURL,
            }, { merge: true });

            setProfileImage(downloadURL);
        } catch (error) {
            console.error('Error uploading image:', error);
            Toast.show({
                type: 'error',
                text1: 'Upload Failed',
                text2: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                {loading ? (
                    <ActivityIndicator color="#7da263" />
                ) : (
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../../assets/images/profile_placeholder.png')}
                        style={styles.profileImage}
                    />
                )}
            </TouchableOpacity>

            <Text style={styles.label}>Logged in as:</Text>
            <Text style={styles.email}>{user?.email || 'Unknown user'}</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        alignItems: 'center',
        backgroundColor: '#FFF9D7',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 20,
        marginTop: 60,
    },
    imageWrapper: {
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#7da263',
        width: 130,
        height: 130,
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    label: {
        fontSize: 16,
        color: '#555',
    },
    email: {
        fontSize: 16,
        color: '#333',
        marginBottom: 40,
    },
    logoutButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});