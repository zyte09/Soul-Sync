import React, { useRef, useState, useEffect } from 'react';
import {
    Animated,
    StyleSheet,
    View,
    Image,
    Pressable,
    Easing,
} from 'react-native';
import { Audio } from 'expo-av';
import { cardImages, cardBackImages } from '../data/cardImages';

export default function TarotFlipCard({ card }) {
    const flipAnim = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const soundRef = useRef(null);

    useEffect(() => {
        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/sounds/flip.mp3')
                );
                soundRef.current = sound;
            } catch (error) {
                console.warn('❌ Error preloading sound:', error);
            }
        };

        loadSound();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync(); // ✅ Clean up
            }
        };
    }, []);

    const playFlipSound = async () => {
        try {
            if (soundRef.current) {
                await soundRef.current.replayAsync();
            }
        } catch (error) {
            console.warn('❌ Error playing sound:', error);
        }
    };

    const flipToBack = () => {
        playFlipSound();
        Animated.timing(flipAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setIsFlipped(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                flipToFront();
            }, 5000);
        });
    };

    const flipToFront = () => {
        playFlipSound();
        Animated.timing(flipAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setIsFlipped(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        });
    };

    const handlePress = () => {
        isFlipped ? flipToFront() : flipToBack();
    };

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });

    const frontImage = cardImages[card.name];
    const backImage = cardBackImages[card.name];

    return (
        <View style={styles.wrapper}>
            <Pressable onPress={handlePress}>
                <View style={styles.cardStack}>
                    <Animated.View style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }]}>
                        <Image source={frontImage} style={styles.image} resizeMode="cover" />
                    </Animated.View>
                    <Animated.View style={[styles.card, styles.back, { transform: [{ rotateY: backInterpolate }] }]}>
                        <Image source={backImage} style={styles.image} resizeMode="cover" />
                    </Animated.View>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: 280,
        height: 440,
        alignSelf: 'center',
        marginBottom: 24,
        perspective: 1000,
    },
    cardStack: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    card: {
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    back: {
        zIndex: 1,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#dfbb66',
    },
});
