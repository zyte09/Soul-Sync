import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

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
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        position: 'absolute',
        top: 50,
        left: 20,
    },
    backText: {
        marginLeft: 6,
        fontSize: 16,
        color: '#3d5149',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3d5149',
        marginBottom: 24,
        textAlign: 'center',
        marginTop: 60,
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
