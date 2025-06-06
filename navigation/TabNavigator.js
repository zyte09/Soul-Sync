import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import HomeScreen from '../screens/Home/HomeScreen';
import CardVaultScreen from '../screens/Vault/CardVaultScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen'; // 🆕 import your new screen

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#5A4FCF',
                tabBarInactiveTintColor: '#aaa',
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                    backgroundColor: '#fffef0',
                    borderTopColor: '#ddd',
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === 'Home') iconName = 'home';
                    else if (route.name === 'Vault') iconName = 'archive';
                    else if (route.name === 'Calendar') iconName = 'calendar'; // 🆕
                    else if (route.name === 'Profile') iconName = 'user';

                    return <Feather name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Vault" component={CardVaultScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
