import React, { useState, useEffect, useContext } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';

export default function ForgotPasswordScreen() {
    const { user } = useContext(AuthContext);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleReset = async () => {
        if (!email) {
            Toast.show({ type: 'error', text1: 'Email required' });
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Toast.show({ type: 'success', text1: 'Reset link sent!' });
        } catch (error) {
            let message = 'Something went wrong.';
            if (error.code === 'auth/user-not-found') {
                message = 'No account found with that email.';
            }
            Toast.show({ type: 'error', text1: 'Error', text2: message });
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Image
                source={require('../../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.title}>Reset your password</Text>

            <TextInput
                style={styles.input}
                placeholder="user@gmail.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleReset}>
                <Text style={styles.buttonText}>Send Reset Link</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9D7',
        padding: 30,
        justifyContent: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginBottom: -20,
        marginTop: -40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#7da263',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
