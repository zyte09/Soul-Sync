import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigator from './navigation/TabNavigator';
import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './utils/toastConfig';

import ForgotPasswordScreen from './screens/Profile/ForgotPasswordScreen';
import AboutUsScreen from './screens/Profile/AboutUsScreen';
import MoodSelectionScreen from './screens/Home/MoodSelectionScreen';
import JournalEntryScreen from './screens/Home/JournalEntryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppWrapper />
                <Toast config={toastConfig} position="top" topOffset={10} />
            </NavigationContainer>
        </AuthProvider>
    );
}

function AppWrapper() {
    const { user, authLoading } = useContext(AuthContext);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [checkingStorage, setCheckingStorage] = useState(true);

    useEffect(() => {
        const checkOnboarding = async () => {
            const seen = await AsyncStorage.getItem('onboardingCompleted');
            setShowOnboarding(!seen);
            setCheckingStorage(false);
        };
        checkOnboarding();
    }, []);

    const handleFinish = async () => {
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        setShowOnboarding(false);
    };

    if (authLoading || checkingStorage) {
        return (
            <View style={styles.splashContainer}>
                <Image
                    source={require('./assets/images/icon.png')}
                    style={styles.splashLogo}
                />
                <ActivityIndicator size="large" color="#7da263" style={{ marginTop: 20 }} />
            </View>
        );
    }

    // 🔒 Not logged in (Onboarding/Login stack)
    if (!user) {
        return (
            <Stack.Navigator>
                {showOnboarding ? (
                    <Stack.Screen
                        name="Onboarding"
                        options={{ headerShown: false }}
                        children={() => <OnboardingScreen onFinish={handleFinish} />}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                            options={{
                                title: 'Forgot Password',
                                headerShown: true,
                                headerStyle: { backgroundColor: '#FFF9D7' },
                                headerTitleStyle: {
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    color: '#3d5149',
                                },
                                headerTintColor: '#3d5149',
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        );
    }

    // ✅ Logged in (Main app stack)
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Main"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="MoodSelectionScreen"
                component={MoodSelectionScreen}
                options={{ title: 'How Are You Feeling?' }}
            />
            <Stack.Screen
                name="JournalEntryScreen"
                component={JournalEntryScreen}
                options={{
                    title: '📝 Write About It',
                    headerStyle: { backgroundColor: '#FFF9D7' },
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: '#3d5149',
                    },
                    headerTintColor: '#3d5149',
                }}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                    title: 'Forgot Password',
                    headerShown: true,
                    headerStyle: { backgroundColor: '#FFF9D7' },
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: '#3d5149',
                    },
                    headerTintColor: '#3d5149',
                }}
            />
            <Stack.Screen
                name="AboutUs"
                component={AboutUsScreen}
                options={{
                    title: 'About Us',
                    headerStyle: { backgroundColor: '#FFF9D7' },
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: '#3d5149',
                    },
                    headerTintColor: '#3d5149',
                }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF9D7',
    },
    splashLogo: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
});
