import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onFinish }) {
    const scrollX = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
        }).start();
    }, []);

    const slides = [
        {
            title: 'Welcome to Soul Sync',
            description: 'A calming mood journal with tarot-inspired prompts.',
            quote: '“Start where you are. Use what you have. Do what you can.”',
        },
        {
            title: 'Check In Once a Day',
            description: 'Pick your mood and reflect with a gentle card.',
            quote: '“One small step a day is still progress.”',
        },
        {
            title: 'Start Syncing',
            description: 'Ready to connect with yourself?',
            quote: '“Your inner world deserves your attention.”',
            isFinal: true,
        },
    ];

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const position = event.nativeEvent.contentOffset.x;
                const idx = Math.round(position / width);
                setCurrentIndex(idx);
            },
        }
    );

    return (
        <View style={styles.container}>
            <View style={styles.fixedLogoContainer}>
                <Image
                    source={require('../../assets/images/icon.png')}
                    style={styles.logo}
                />
            </View>

            <Animated.ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={handleScroll}
            >
                {slides.map((slide, index) => {
                    const fadeAnim = scrollX.interpolate({
                        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                        outputRange: [0, 1, 0],
                        extrapolate: 'clamp',
                    });

                    const translateYAnim = scrollX.interpolate({
                        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                        outputRange: [30, 0, 30],
                        extrapolate: 'clamp',
                    });

                    return (
                        <View style={styles.slide} key={index}>
                            <View style={styles.contentWrapper}>
                                <Animated.View
                                    style={{
                                        opacity: fadeAnim,
                                        transform: [{ translateY: translateYAnim }],
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={styles.title}>{slide.title}</Text>
                                    <Text style={styles.description}>{slide.description}</Text>
                                    <Text style={styles.quote}>{slide.quote}</Text>

                                    {slide.isFinal && (
                                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                            <TouchableOpacity style={styles.button} onPress={onFinish}>
                                                <Text style={styles.buttonText}>Get Started</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    )}
                                </Animated.View>
                            </View>
                        </View>
                    );
                })}
            </Animated.ScrollView>

            <View style={styles.indicatorContainer}>
                {slides.map((_, i) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [width * (i - 1), width * i, width * (i + 1)],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });
                    return <Animated.View key={i} style={[styles.indicator, { opacity }]} />;
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9D7',
    },
    fixedLogoContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 10,
    },
    logo: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
    },
    slide: {
        width,
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#3d5149',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#3d5149',
        marginBottom: 12,
    },
    quote: {
        fontSize: 14,
        color: '#3d5149',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
        opacity: 0.8,
    },
    button: {
        marginTop: 30,
        backgroundColor: '#7da263',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    indicator: {
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: '#3d5149',
        marginHorizontal: 5,
    },
});
