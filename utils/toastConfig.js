import React from 'react';
import { View, Text } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';

export const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: '#4CAF50',
                backgroundColor: '#eafaf0',
                borderRadius: 12,
                marginTop: 70,
                marginHorizontal: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                alignSelf: 'center',
            }}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 6 }}
            text1Style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#2e7d32',
            }}
            text2Style={{
                fontSize: 13,
                color: '#444',
            }}
            renderLeadingIcon={() => (
                <Feather
                    name="check-circle"
                    size={32}
                    color="#2e7d32"
                    style={{ marginLeft: 15, marginTop: 15}}
                />
            )}
        />
    ),

    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: '#F44336',
                backgroundColor: '#fcebea',
                borderRadius: 12,
                marginTop: 70,
                marginHorizontal: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 6 }}
            text1Style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#b71c1c',
            }}
            text2Style={{
                fontSize: 13,
                color: '#444',
            }}
            renderLeadingIcon={() => (
                <Feather
                    name="x-circle"
                    size={32}
                    color="#b71c1c"
                    style={{ marginLeft: 15, marginTop: 15}}
                />
            )}
        />
    ),
};
