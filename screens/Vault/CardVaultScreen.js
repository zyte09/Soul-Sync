import React, { useEffect, useState, useContext, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView,
    Pressable,
    TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/firebaseConfig';
import {
    collection,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import Toast from 'react-native-toast-message';

const highlightMatch = (text, query) => {
    if (!query) return <Text>{text}</Text>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => (
        <Text
            key={index}
            style={part.toLowerCase() === query.toLowerCase() ? styles.highlight : {}}
        >
            {part}
        </Text>
    ));
};

const CardVaultScreen = () => {
    const { user } = useContext(AuthContext);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [editedJournal, setEditedJournal] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const undoRef = useRef({});
    const deletedEntryRef = useRef(null);

    const fetchEntries = async () => {
        try {
            const q = query(
                collection(db, 'users', user.uid, 'entries'),
                orderBy('timestamp', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEntries(data);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchEntries();
    }, [user]);

    const handleDelete = (entry) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this journal entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => confirmDelete(entry),
                },
            ]
        );
    };

    const confirmDelete = (entry) => {
        Toast.show({
            type: 'info',
            text1: 'Entry deleted',
            text2: 'You can undo this action',
            position: 'bottom',
            autoHide: true,
            visibilityTime: 3000,
        });

        deletedEntryRef.current = entry;
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));

        undoRef.current[entry.id] = setTimeout(async () => {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'entries', entry.id));
                deletedEntryRef.current = null;
            } catch (err) {
                console.error('Error permanently deleting:', err);
            }
        }, 3000);
    };

    const handleUndo = async () => {
        const entry = deletedEntryRef.current;
        if (entry) {
            clearTimeout(undoRef.current[entry.id]);
            await setDoc(doc(db, 'users', user.uid, 'entries', entry.id), entry);
            deletedEntryRef.current = null;
            fetchEntries();
        }
    };

    const openModal = (entry) => {
        setSelectedEntry(entry);
        setEditedJournal(entry.journal);
        setModalVisible(true);
        setIsEditing(false);
    };

    const closeModal = () => {
        setSelectedEntry(null);
        setModalVisible(false);
        setIsEditing(false);
    };

    const saveEdit = async () => {
        try {
            const updated = {
                ...selectedEntry,
                journal: editedJournal,
                editedAt: new Date(),
            };
            await updateDoc(doc(db, 'users', user.uid, 'entries', selectedEntry.id), updated);
            fetchEntries();
            closeModal();
        } catch (err) {
            console.error('Failed to update journal:', err);
        }
    };

    const filteredEntries = entries.filter((entry) => {
        const query = searchQuery.toLowerCase();
        const moodName = entry.mood?.name || 'Mindful Moment';
        const cardName = entry.card?.name || '';
        const journalText = entry.journal || '';

        return (
            moodName.toLowerCase().includes(query) ||
            cardName.toLowerCase().includes(query) ||
            journalText.toLowerCase().includes(query)
        );
    });


    const renderItem = ({ item }) => {
        const moodName = item.mood?.name || '✨ Mindful Moment';
        const cardName = item.card?.name || '';
        const journal = item.journal || '';
        const date = item.timestamp?.toDate().toLocaleDateString() || 'No Date';

        return (
            <TouchableOpacity onPress={() => openModal(item)}>
                <View style={styles.entryCard}>
                    <View style={styles.topRow}>
                        <Text style={styles.moodLabel}>{highlightMatch(moodName.toUpperCase(), searchQuery)}</Text>
                        <TouchableOpacity onPress={() => handleDelete(item)}>
                            <Feather name="trash-2" size={24} color="#999" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.cardTitle}>{highlightMatch(cardName, searchQuery)}</Text>
                    <Text numberOfLines={2} style={styles.journalText}>{highlightMatch(journal, searchQuery)}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#7da263" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Mood Journal</Text>

            <View style={styles.searchWrapper}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search mood, card, or journal..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.clearIcon}
                    >
                        <Feather name="x" size={24} color="#999" />
                    </TouchableOpacity>
                )}
            </View>


            <FlatList
                data={filteredEntries}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalMood}>{selectedEntry?.mood?.name}</Text>
                            <Text style={styles.modalCard}>{selectedEntry?.card?.name}</Text>

                            {isEditing ? (
                                <TextInput
                                    style={styles.editInput}
                                    multiline
                                    value={editedJournal}
                                    onChangeText={setEditedJournal}
                                />
                            ) : (
                                <Text style={styles.modalJournal}>{selectedEntry?.journal}</Text>
                            )}

                            <Text style={styles.modalDate}>
                                {selectedEntry?.timestamp?.toDate().toLocaleDateString()}
                            </Text>

                            {selectedEntry?.editedAt && (
                                <Text style={styles.editedDate}>
                                    Edited at{' '}
                                    {new Date(selectedEntry.editedAt.seconds * 1000).toLocaleDateString()}
                                </Text>
                            )}
                        </ScrollView>

                        {isEditing ? (
                            <View style={styles.modalButtonRow}>
                                <Pressable onPress={saveEdit} style={styles.closeButton}>
                                    <Text style={styles.closeText}>Save</Text>
                                </Pressable>
                                <Pressable onPress={closeModal} style={[styles.closeButton, { backgroundColor: '#ccc' }]}>
                                    <Text style={styles.closeText}>Cancel</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View style={styles.modalButtonRow}>
                                <Pressable
                                    onPress={() => setIsEditing(true)}
                                    style={[styles.closeButton, { backgroundColor: '#d9b44a' }]}
                                >
                                    <Text style={styles.closeText}>Edit</Text>
                                </Pressable>
                                <Pressable onPress={closeModal} style={styles.closeButton}>
                                    <Text style={styles.closeText}>Close</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            <Toast
                config={{
                    info: ({ text1, text2 }) => (
                        <View style={styles.toast}>
                            <Text style={styles.toastTitle}>{text1}</Text>
                            <Text style={styles.toastMessage}>{text2}</Text>
                            <TouchableOpacity onPress={handleUndo}>
                                <Text style={styles.undoButton}>Undo</Text>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9D7',
        padding: 24,

    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF9D7',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3d5149',
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 16,
    },
    searchWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: '#fffef0',
        borderColor: '#d9d9d9',
        borderWidth: 1.2,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#3d5149',
        paddingRight: 36,
    },
    clearIcon: {
        position: 'absolute',
        right: 8,
        top: '35%',
        transform: [{ translateY: -9 }],
        padding: 4,
    },
    entryCard: {
        backgroundColor: '#fffef0',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moodLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#7da263',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3e5741',
        marginTop: 4,
        marginBottom: 6,
    },
    journalText: {
        fontSize: 15,
        color: '#333',
        marginBottom: 10,
    },
    date: {
        fontSize: 13,
        color: '#777',
        textAlign: 'right',
    },
    editedDate: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    toast: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
        marginHorizontal: 16,
        borderColor: '#7da263',
        borderWidth: 1.5,
        elevation: 5,
        justifyContent: 'center',
    },
    toastTitle: {
        fontWeight: 'bold',
        color: '#3e5741',
        fontSize: 16,
    },
    toastMessage: {
        color: '#5f5f5f',
        fontSize: 15,
        marginTop: 6,
    },
    undoButton: {
        color: '#7da263',
        fontWeight: 'bold',
        fontSize: 15,
        marginTop: 12,
        alignSelf: 'flex-end',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fffef0',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxHeight: '80%',
        elevation: 6,
    },
    modalMood: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7da263',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalCard: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3e5741',
        textAlign: 'center',
        marginBottom: 12,
    },
    modalJournal: {
        fontSize: 15,
        color: '#333',
        marginBottom: 20,
        lineHeight: 22,
    },
    modalDate: {
        fontSize: 13,
        color: '#777',
        textAlign: 'right',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 12,
    },
    closeButton: {
        flex: 1,
        backgroundColor: '#7da263',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    editInput: {
        fontSize: 15,
        backgroundColor: '#f6f4e8',
        padding: 12,
        borderRadius: 10,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
    },

    highlight: {
        backgroundColor: '#fff3a2',
        color: '#3d5149',
        fontWeight: 'bold',
    },
});

export default CardVaultScreen;