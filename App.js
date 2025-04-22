// App.js
import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigator from './navigation/TabNavigator';
import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import LoginScreen from './screens/Auth/LoginScreen';

import { AuthProvider, AuthContext } from './context/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './utils/toastConfig'; // ✅ custom toast theme

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppWrapper />
                <Toast config={toastConfig} position="top" />
            </NavigationContainer>
        </AuthProvider>
    );
}

function AppWrapper() {
    const { user, authLoading } = useContext(AuthContext);
    const [showOnboarding, setShowOnboarding] = useState(true);

    useEffect(() => {
        const checkOnboarding = async () => {
            const seen = await AsyncStorage.getItem('hasSeenOnboarding');
            if (seen === 'true') {
                setShowOnboarding(false);
            }
        };
        checkOnboarding();
    }, []);

    const handleFinish = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        setShowOnboarding(false);
    };

    if (authLoading) return null;

    if (!user) return <LoginScreen />;
    if (showOnboarding) return <OnboardingScreen onFinish={handleFinish} />;
    return <TabNavigator />;
}
