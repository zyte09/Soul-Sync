import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigator from './navigation/TabNavigator';
import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import LoginScreen from './screens/Auth/LoginScreen';

import { AuthProvider, AuthContext } from './context/AuthContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './utils/toastConfig';

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

    if (!user) {
        if (showOnboarding) return <OnboardingScreen onFinish={handleFinish} />;
        return <LoginScreen />;
    }

    return <TabNavigator />;
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
