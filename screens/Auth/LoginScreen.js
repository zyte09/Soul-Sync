import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const { setUser } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loadingType, setLoadingType] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleLogin = async () => {
        setLoadingType('login');
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCred.user);
        } catch (error) {
            let message = 'Something went wrong. Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No account found with that email.';
                    break;
                case 'auth/wrong-password':
                    message = 'That password is incorrect.';
                    break;
                case 'auth/invalid-email':
                    message = 'Please enter a valid email.';
                    break;
                case 'auth/invalid-credential':
                    message = 'Email or password is incorrect.';
                    break;
            }

            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: message,
                position: 'top',
                visibilityTime: 2500,
                autoHide: true,
            });
        } finally {
            setLoadingType(null);
        }
    };

    const handleSignUp = async () => {
        setLoadingType('signup');
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCred.user);
        } catch (error) {
            let message = 'Something went wrong.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'That email is already in use.';
                    break;
                case 'auth/weak-password':
                    message = 'Password must be at least 6 characters.';
                    break;
                case 'auth/invalid-email':
                    message = 'Enter a valid email address.';
                    break;
            }

            Toast.show({
                type: 'error',
                text1: 'Sign Up Failed',
                text2: message,
                position: 'top',
                visibilityTime: 2500,
                autoHide: true,
            });
        } finally {
            setLoadingType(null);
        }
    };

    const resetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('onboardingCompleted');
            console.log('✅ AsyncStorage key "onboardingCompleted" removed.');
            Alert.alert(
                'Onboarding Reset',
                'The onboarding screen will show again the next time you open the app.'
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to reset onboarding.');
            console.error('❌ AsyncStorage error:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Logo with long press reset */}
            <TouchableOpacity onLongPress={resetOnboarding} activeOpacity={1}>
                <Animated.Image
                    source={require('../../assets/images/icon.png')}
                    style={[styles.logo, { opacity: fadeAnim }]}
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <Text style={styles.title}>Welcome</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <View style={styles.passwordWrapper}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.iconWrapper}
                >
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#5A4FCF" />
                </TouchableOpacity>
            </View>

            {loadingType && (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#5A4FCF" />
                    <Text style={styles.loadingText}>
                        {loadingType === 'login' ? 'Logging in...' : 'Creating account...'}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                onPress={handleLogin}
                style={[styles.primaryButton, loadingType === 'login' && styles.disabledButton]}
                disabled={loadingType === 'login'}
            >
                <Text style={styles.primaryButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleSignUp}
                style={[styles.secondaryButton, loadingType === 'signup' && styles.disabledButton]}
                disabled={loadingType === 'signup'}
            >
                <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        backgroundColor: '#FFF9D7',
    },
    logo: {
        width: 250,
        height: 250,
        alignSelf: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#3d5149',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 14,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingRight: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        fontSize: 16,
    },
    iconWrapper: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#7da263',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#dfbb66',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#3d5149',
    },
});
