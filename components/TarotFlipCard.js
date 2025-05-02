import React, { useRef } from 'react';
import {
    Animated,
    StyleSheet,
    View,
    Image,
    Pressable,
    Easing,
} from 'react-native';
import { cardImages, cardBackImages } from '../data/cardImages';

export default function TarotFlipCard({ card }) {
    const flipAnim = useRef(new Animated.Value(0)).current;

    const flipToBack = () => {
        Animated.timing(flipAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const flipToFront = () => {
        Animated.timing(flipAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
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
            <Pressable onPressIn={flipToBack} onPressOut={flipToFront}>
                <View style={styles.cardStack}>
                    {/* Front */}
                    <Animated.View
                        style={[
                            styles.card,
                            { transform: [{ rotateY: frontInterpolate }] },
                        ]}
                    >
                        <Image
                            source={frontImage}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </Animated.View>

                    {/* Back */}
                    <Animated.View
                        style={[
                            styles.card,
                            styles.back,
                            { transform: [{ rotateY: backInterpolate }] },
                        ]}
                    >
                        <Image
                            source={backImage}
                            style={styles.image}
                            resizeMode="cover"
                        />
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
