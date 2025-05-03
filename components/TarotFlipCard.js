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
import { useIsFocused } from '@react-navigation/native';
import { cardImages, cardBackImages } from '../data/cardImages';

export default function TarotFlipCard({ card }) {
    const isFocused = useIsFocused(); // 👈 Detect screen focus
    const flipAnim = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef(null);
    const soundRef = useRef(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // 🔊 Load sound once
    useEffect(() => {
        let isMounted = true;
        const loadSound = async () => {
            const { sound } = await Audio.Sound.createAsync(
                require('../assets/sounds/flip.mp3'),
                { shouldPlay: false }
            );
            if (isMounted) soundRef.current = sound;
        };
        loadSound();

        return () => {
            isMounted = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (soundRef.current) soundRef.current.unloadAsync();
        };
    }, []);

    useEffect(() => {
        if (card) {
            console.log("🃏 TarotFlipCard received card:", card);
            console.log("🖼️ Front image loaded:", cardImages[card.name]);
            console.log("🖼️ Back image loaded:", cardBackImages[card.name]);
        }
    }, [card]);

    // 🧹 Stop sound + animation when screen loses focus
    useEffect(() => {
        if (!isFocused) {
            // Stop animation
            flipAnim.stopAnimation();
            flipAnim.setValue(0); // reset to front
            setIsFlipped(false);

            // Clear timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            // Stop sound
            if (soundRef.current) {
                soundRef.current.stopAsync();
            }
        }
    }, [isFocused]);

    const playFlipSound = async () => {
        if (soundRef.current && isFocused) {
            await soundRef.current.replayAsync();
        }
    };

    const flipToBack = () => {
        if (!isFocused) return;

        playFlipSound();
        Animated.timing(flipAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setIsFlipped(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => flipToFront(), 5000);
        });
    };

    const flipToFront = () => {
        if (!isFocused) return;

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
        if (!isFocused) return;
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
