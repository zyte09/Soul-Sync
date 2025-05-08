import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Modal,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebase/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toastConfig } from '../../utils/toastConfig';

export default function LoginScreen() {
    const navigation = useNavigation();
    const { setUser } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loadingType, setLoadingType] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [signupVisible, setSignupVisible] = useState(false);
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const resetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('onboardingCompleted');
            Alert.alert('Onboarding Reset', 'The onboarding screen will show again next time.');
        } catch (error) {
            Alert.alert('Error', 'Failed to reset onboarding.');
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
        const level = passed >= 4 ? 'Strong' : passed === 3 ? 'Medium' : 'Weak';
        return { rules, level };
    };

    const passwordCheck = getPasswordStrength(signupPassword);
    const passedRulesCount = Object.values(passwordCheck.rules).filter(Boolean).length;

    const handleLogin = async () => {
        setLoadingType('login');
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCred.user);
        } catch (error) {
            let message = 'Something went wrong.';
            switch (error.code) {
                case 'auth/user-not-found': message = 'No account found.'; break;
                case 'auth/wrong-password': message = 'Wrong password.'; break;
                case 'auth/invalid-email': message = 'Invalid email.'; break;
            }
            Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
        } finally {
            setLoadingType(null);
        }
    };

    const handleSignup = async () => {
        if (!signupEmail || !signupPassword || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'All fields are required.' });
            return;
        }
        if (signupPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Passwords do not match.' });
            return;
        }
        if (signupPassword.length < 6) {
            Toast.show({ type: 'error', text1: 'Password too short (min 6 chars).' });
            return;
        }

        setLoadingType('signup');
        try {
            const userCred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);

            // ✅ Show success toast
            Toast.show({ type: 'success', text1: 'Account Created Successfully!' });

            // ✅ Wait 1 second before proceeding (gives time to see toast)
            setTimeout(() => {
                setUser(userCred.user);
                setSignupVisible(false);
            }, 1000);

        } catch (error) {
            let message = 'Something went wrong.';
            switch (error.code) {
                case 'auth/email-already-in-use': message = 'Email already in use.'; break;
                case 'auth/invalid-email': message = 'Invalid email.'; break;
            }
            Toast.show({ type: 'error', text1: 'Sign Up Failed', text2: message });
        } finally {
            setLoadingType(null);
        }
    };


    return (
        <View style={styles.container}>
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
                {password !== '' && (
                    <TouchableOpacity
                        style={styles.iconWrapper}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Feather
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color="#5A4FCF"
                        />
                    </TouchableOpacity>
                )}
            </View>


            <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={{ alignSelf: 'flex-end', marginBottom: 10 }}
            >
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

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
                onPress={() => setSignupVisible(true)}
                style={styles.secondaryButton}
            >
                <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Sign Up Modal */}
            <Modal visible={signupVisible} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Account</Text>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={signupEmail}
                                onChangeText={setSignupEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                secureTextEntry={!showSignupPassword}
                                value={signupPassword}
                                onChangeText={setSignupPassword}
                            />
                            {signupPassword !== '' && (
                                <TouchableOpacity
                                    style={styles.iconWrapper}
                                    onPress={() => setShowSignupPassword(!showSignupPassword)}
                                >
                                    <Feather
                                        name={showSignupPassword ? 'eye' : 'eye-off'}
                                        size={20}
                                        color="#5A4FCF"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Confirm Password"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            {confirmPassword !== '' && (
                                <TouchableOpacity
                                    style={styles.iconWrapper}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Feather
                                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                                        size={20}
                                        color="#5A4FCF"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={{ fontWeight: 'bold', marginTop: 10, color: '#444' }}>
                            Level:{' '}
                            <Text style={{ color: passwordCheck.level === 'Strong' ? '#3aa655' : passwordCheck.level === 'Medium' ? '#f0ad4e' : '#d9534f' }}>
                                {passwordCheck.level}
                            </Text>
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
                            { rule: 'hasNumber', label: 'Should contain number' },
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
                            <TouchableOpacity style={styles.modalBtn} onPress={handleSignup}>
                                <Text style={styles.modalBtnText}>Sign Up</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#bbb' }]}
                                onPress={() => setSignupVisible(false)}
                            >
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Toast config={toastConfig} position="top" topOffset={10} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF9D7',
    },
    logo: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#3d5149',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,

    },
    passwordWrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    iconWrapper: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: '#6c8f45',
        fontSize: 13,
        fontWeight: '500',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#7da263',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
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
        width: '100%',
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

});
