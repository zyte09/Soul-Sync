// Updated logic inside your useEffect to debug and fix card filtering
useEffect(() => {
    const loadData = async () => {
        try {
            const storedMood = await AsyncStorage.getItem('selectedMood');
            const storedHistory = await AsyncStorage.getItem('moodHistory');
            if (storedMood) setSelectedMood(JSON.parse(storedMood));
            if (storedHistory) setMoodHistory(JSON.parse(storedHistory));

            const today = new Date().toISOString().split('T')[0];
            const cardRef = doc(db, 'users', user.uid, 'dailyCard', today);
            const existing = await getDoc(cardRef);

            if (existing.exists()) {
                const data = existing.data();
                const cardData = {
                    name: data.name,
                    meaning: data.meaning,
                    Description: data.description,
                };
                setCard(cardData);
                await AsyncStorage.setItem('todaysCard', JSON.stringify(cardData));
                console.log("📥 Loaded today's card from Firestore:", cardData);
            } else {
                const querySnapshot = await getDocs(collection(db, 'cards'));
                const validCards = [];

                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const imageKey = data.name.replace('The ', '').trim();

                    if (cardImages[imageKey]) {
                        console.log('✅ Valid card:', data.name);
                        validCards.push({
                            name: data.name,
                            meaning: data.meaning,
                            Description: data.description,
                        });
                    } else {
                        console.warn('🛑 Skipping card - no matching image:', data.name);
                    }
                });

                if (validCards.length === 0) {
                    console.warn("⚠️ No tarot cards found with matching images.");
                    return;
                }

                const random = validCards[Math.floor(Math.random() * validCards.length)];
                setCard(random);
                await AsyncStorage.setItem('todaysCard', JSON.stringify(random));

                await setDoc(cardRef, {
                    name: random.name,
                    meaning: random.meaning,
                    description: random.Description || random.description || '',
                    savedAt: new Date(),
                });
                console.log("🆕 Today's card saved to Firestore:", random);
            }
        } catch (err) {
            console.error("❌ Error loading today's card:", err);
        } finally {
            setLoading(false);
        }
    };

    loadData();
}, [user]);
