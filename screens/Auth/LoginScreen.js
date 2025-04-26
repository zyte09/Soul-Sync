import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    Animated
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

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
            useNativeDriver: true
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
                autoHide: true
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
                autoHide: true
            });
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require('../../assets/icon.png')}
                style={[styles.logo, { opacity: fadeAnim }]}
                resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to Soul Sync</Text>

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
                    <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#5A4FCF"
                    />
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
                style={[styles.loginButton, loadingType === 'login' && styles.disabledButton]}
                disabled={loadingType === 'login'}
            >
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleSignUp}
                style={[styles.signUpButton, loadingType === 'signup' && styles.disabledButton]}
                disabled={loadingType === 'signup'}
            >
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        backgroundColor: '#FFF9D7' // soft background
    },
    logo: {
        width: 250,
        height: 250,
        alignSelf: 'center',
        marginBottom: 30
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#3d5149'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 14,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff'
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingRight: 10,
        marginBottom: 15,
        backgroundColor: '#fff'
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        fontSize: 16
    },
    iconWrapper: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginButton: {
        backgroundColor: '#7da263',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    signUpButton: {
        backgroundColor: '#dfbb66',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    disabledButton: {
        opacity: 0.7
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#3d5149'
    }
});
