import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ActivityIndicator,
    Modal,
    TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { toastConfig } from '../../utils/toastConfig';
const getImageKey = (uid) => `PROFILE_IMAGE_URI_${uid}`;

export default function ProfileScreen() {
    const { user, setUser } = useContext(AuthContext);
    const navigation = useNavigation();
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        loadImageFromStorage();
    }, []);

    const loadImageFromStorage = async () => {
        try {
            const key = getImageKey(user.uid);
            const uri = await AsyncStorage.getItem(key);
            if (uri) setProfileImage(uri);
        } catch (err) {
            console.error('Failed to load image', err);
        } finally {
            setLoading(false);
        }
    };

    const saveImageToStorage = async (uri) => {
        try {
            setLoading(true);
            const filename = uri.split('/').pop();
            const newPath = FileSystem.documentDirectory + filename;
            await FileSystem.copyAsync({ from: uri, to: newPath });

            const key = getImageKey(user.uid);
            await AsyncStorage.setItem(key, newPath);

            setProfileImage(newPath);
            Toast.show({ type: 'success', text1: 'Profile photo updated!' });
        } catch (err) {
            console.error('Failed to save image', err);
            Toast.show({ type: 'error', text1: 'Failed to save photo' });
        } finally {
            setLoading(false);
        }
    };

    const removeProfilePhoto = async () => {
        try {
            setLoading(true);
            const key = getImageKey(user.uid);
            await AsyncStorage.removeItem(key);
            setProfileImage(null);
            Toast.show({ type: 'success', text1: 'Profile photo removed' });
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Failed to remove photo' });
        } finally {
            setLoading(false);
        }
    };

    const launchCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Camera access is needed.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
            await saveImageToStorage(result.assets[0].uri);
        }
    };

    const launchGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Gallery access is needed.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
            await saveImageToStorage(result.assets[0].uri);
        }
    };

    const getPasswordStrength = (password) => {
        const rules = {
            minLength: password.length >= 6,
            hasLower: /[a-z]/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
        };
        const passed = Object.values(rules).filter(Boolean).length;
        let level = 'Weak';
        if (passed >= 4) level = 'Strong';
        else if (passed === 3) level = 'Medium';
        return { rules, level };
    };

    const passwordCheck = getPasswordStrength(newPassword);
    const passedRulesCount = Object.values(passwordCheck.rules).filter(Boolean).length;

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                onPress: async () => {
                    try {
                        await signOut(auth);
                        Toast.show({ type: 'success', text1: 'Signed out successfully 👋' });
                        setTimeout(() => setUser(null), 800);
                    } catch (error) {
                        Toast.show({ type: 'error', text1: 'Logout Failed', text2: error.message });
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'Please fill all fields' });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({ type: 'error', text1: 'Password too short (min 6 chars)' });
            return;
        }

        if (oldPassword === newPassword) {
            Toast.show({ type: 'error', text1: 'New password must be different' });
            return;
        }

        setUpdating(true); // ⏳ Start loading

        try {
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPassword);

            Toast.show({ type: 'success', text1: 'Password updated successfully' });
            setModalVisible(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                Toast.show({ type: 'error', text1: 'Incorrect current password' });
            } else {
                Toast.show({ type: 'error', text1: 'Update failed', text2: error.message });
            }
        } finally {
            setUpdating(false); // ✅ Stop loading
        }
    };




    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <TouchableOpacity onPress={() => setPhotoOptionsVisible(true)} style={styles.imageWrapper}>
                {loading ? (
                    <ActivityIndicator color="#7da263" />
                ) : (
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../../assets/images/profile_placeholder.png')}
                        style={styles.profileImage}
                    />
                )}
            </TouchableOpacity>
            <Text style={styles.editText}>Tap to change photo</Text>

            <Text style={styles.email}>{user?.email || 'Unknown user'}</Text>

            <TouchableOpacity style={styles.changePassButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.changePassText}>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Change Password</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Old Password"
                            secureTextEntry={!showOld}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                        {oldPassword !== '' && (
                            <Feather
                                name={showOld ? 'eye' : 'eye-off'}
                                size={20}
                                color="#5A4FCF"
                                style={styles.eyeIcon}
                                onPress={() => setShowOld(!showOld)}
                            />
                        )}
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            secureTextEntry={!showNew}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        {newPassword !== '' && (
                            <Feather
                                name={showNew ? 'eye' : 'eye-off'}
                                size={20}
                                color="#5A4FCF"
                                style={styles.eyeIcon}
                                onPress={() => setShowNew(!showNew)}
                            />
                        )}
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            secureTextEntry={!showConfirm}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        {confirmPassword !== '' && (
                            <Feather
                                name={showConfirm ? 'eye' : 'eye-off'}
                                size={20}
                                color="#5A4FCF"
                                style={styles.eyeIcon}
                                onPress={() => setShowConfirm(!showConfirm)}
                            />
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(false);
                            navigation.navigate('ForgotPassword');
                        }}
                    >
                        <Text style={{
                            color: '#6c8f45',
                            fontSize: 13,
                            marginBottom: 10,
                            textAlign: 'right',
                            textDecorationLine: 'underline'
                        }}>
                            Forgot your password?
                        </Text>
                    </TouchableOpacity>

                    <Text style={{ fontWeight: 'bold', marginTop: 10, color: '#444' }}>
                        Level: <Text style={{ color: passwordCheck.level === 'Strong' ? '#3aa655' : passwordCheck.level === 'Medium' ? '#f0ad4e' : '#d9534f' }}>{passwordCheck.level}</Text>
                    </Text>

                    <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 12 }}>
                        {[...Array(4)].map((_, i) => (
                            <View
                                key={i}
                                style={{
                                    flex: 1,
                                    height: 8,
                                    marginHorizontal: 3,
                                    borderRadius: 10,
                                    backgroundColor: i < passedRulesCount ? '#3aa655' : '#fff3c4',
                                }}
                            />
                        ))}
                    </View>

                    {[
                        { rule: 'minLength', label: 'Minimum 6 characters' },
                        { rule: 'hasLower', label: 'Should contain lowercase' },
                        { rule: 'hasUpper', label: 'Should contain uppercase' },
                        { rule: 'hasNumber', label: 'Should contain numbers' },
                    ].map(({ rule, label }) => (
                        <View key={rule} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Feather
                                name={passwordCheck.rules[rule] ? 'check' : 'x'}
                                size={16}
                                color={passwordCheck.rules[rule] ? '#3aa655' : '#999'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={{ color: passwordCheck.rules[rule] ? '#3aa655' : '#999' }}>{label}</Text>
                        </View>
                    ))}

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalBtn, updating && { opacity: 0.7 }]}
                            onPress={handlePasswordChange}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.modalBtnText}>Update</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: '#bbb' }]}
                            onPress={() => setModalVisible(false)}
                            disabled={updating} // optional: prevent cancel while loading
                        >
                            <Text style={styles.modalBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>


                </View>
                <Toast config={toastConfig} position="top" topOffset={10} />
            </View>
        </Modal>
            <Modal
                visible={photoOptionsVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPhotoOptionsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.photoModalCard}>
                        <Text style={styles.photoModalTitle}>Change Profile Photo</Text>
                        <Text style={styles.photoModalSubtitle}>Choose an option</Text>

                        <TouchableOpacity style={styles.photoModalOption} onPress={() => { setPhotoOptionsVisible(false); launchGallery(); }}>
                            <Text style={styles.photoModalOptionText}>CHOOSE FROM GALLERY</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.photoModalOption} onPress={() => { setPhotoOptionsVisible(false); launchCamera(); }}>
                            <Text style={styles.photoModalOptionText}>TAKE PHOTO</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.photoModalOption} onPress={() => { setPhotoOptionsVisible(false); removeProfilePhoto(); }}>
                            <Text style={styles.photoModalOptionText}>REMOVE PHOTO</Text>
                        </TouchableOpacity>

                        <View style={styles.photoModalDivider} />

                        <TouchableOpacity style={styles.photoModalOption} onPress={() => setPhotoOptionsVisible(false)}>
                            <Text style={styles.photoModalCancelText}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Text style={styles.versionText}>App Version: 1.0.0</Text>

            <TouchableOpacity style={styles.aboutUsButton} onPress={() => navigation.navigate('AboutUs')}>
                <Text style={styles.aboutUsText}>About Us</Text>
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
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editText: {
        color: '#777',
        fontSize: 14,
        marginBottom: 10,
    },
    email: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    changePassButton: {
        backgroundColor: '#6c8f45',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 16,
    },
    changePassText: {
        color: '#fff',
        fontSize: 16,
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        width: '85%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 14,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        height: 44,
    },
    eyeIcon: {
        marginLeft: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    modalBtn: {
        flex: 1,
        backgroundColor: '#7da263',
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    modalBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    photoModalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingTop: 24,
        paddingBottom: 10,
        paddingHorizontal: 24,
        marginHorizontal: 30,
        width: '85%',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    photoModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
    },
    photoModalSubtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
    },
    photoModalOption: {
        paddingVertical: 10,
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    photoModalOptionText: {
        fontSize: 15,
        color: '#007BFF',
        fontWeight: '600',
    },
    photoModalCancelText: {
        fontSize: 15,
        color: '#999',
        fontWeight: '500',
    },
    photoModalDivider: {
        height: 1,
        backgroundColor: '#eee',
        width: '100%',
        marginTop: 10,
        marginBottom: 6,
    },

    versionText: {
        marginTop: 30,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },

    aboutUsButton: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        elevation: 2,
    },
    aboutUsText: {
        color: '#3d5149',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
