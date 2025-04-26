import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function OnboardingScreen({ onFinish }) {
    return (
        <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.container}
        >
            <View style={styles.page}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Welcome to Soul Sync</Text>
                <Text style={styles.text}>
                    A calming mood journal with tarot-inspired prompts.
                </Text>
            </View>

            <View style={styles.page}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Check In Once a Day</Text>
                <Text style={styles.text}>
                    Pick your mood and reflect with a gentle card.
                </Text>
            </View>

            <View style={styles.page}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Start Syncing</Text>
                <Text style={styles.text}>Ready to connect with yourself?</Text>
                <TouchableOpacity style={styles.button} onPress={onFinish}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f3dd' },
    page: {
        width: screenWidth,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#FFF9D7'
    },
    logo: {
        height: 250,
        width: 250,
        marginBottom: 20,
        marginTop: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#3d5149'
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: '#3d5149'
    },
    button: {
        marginTop: 20,
        backgroundColor: '#7da263',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
