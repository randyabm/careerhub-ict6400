/* ==========================================================================
   App.js - entry point and navigation
   ICT6400 Assessment 4 - CareerHub mobile

   The website's five pages become five bottom tabs. The tab bar replaces the
   collapsed hamburger menu, so every section is always one tap away.
   ========================================================================== */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/state/AppContext';
import DashboardScreen from './src/screens/DashboardScreen';
import HomeScreen from './src/screens/HomeScreen';
import JobsScreen from './src/screens/JobsScreen';
import LoginScreen from './src/screens/LoginScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'home',
  Jobs: 'briefcase',
  Resources: 'book',
  Dashboard: 'grid',
  Login: 'person',
};

/* The navy bar with the brand name, like the site header. */
function BrandBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.brandBar, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.brand}>CareerHub</Text>
    </View>
  );
}

function Tabs() {
  const { storageReady } = useApp();

  /* Wait for the saved ids, so that buttons never show the wrong state. */
  if (!storageReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: () => <BrandBar />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS[route.name]} color={color} size={size} />
          ),
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
          tabBarStyle: { backgroundColor: colors.navy, borderTopWidth: 0 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Jobs" component={JobsScreen} />
        <Tab.Screen name="Resources" component={ResourcesScreen} />
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Login" component={LoginScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Tabs />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
  },
  brandBar: { backgroundColor: colors.navy, paddingBottom: 8, alignItems: 'center' },
  brand: { color: '#ffffff', fontSize: 20, fontWeight: '700', letterSpacing: 0.3 },
});
