import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {AuthProvider} from './app/contexts/AuthContext';
import LoginScreen from './app/screens/Login';
import { ThemeProvider } from './app/components/theme-provider';
import firebaseService from './app/services/firebaseService';
import { View, Text } from 'react-native';
import HomeScreen from './app/screens/Home';
import SignupScreen from './app/screens/Signup';
import AppNavigator from './app/navigation/AppNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Firebase at app startup
  useEffect(() => {
    const initApp = async () => {
      try {
        await firebaseService.initializeFirebase();
        console.log("Firebase initialized at app level");
        setFirebaseReady(true);
      } catch (error: any) {
        // Handle default app already configured error as success
        if (error.message?.includes('Default app has already been configured')) {
          console.log("Firebase was already initialized by native code");
          setFirebaseReady(true);
        } else {
          console.error("Failed to initialize Firebase at app level:", error);
          setError(error.message);
        }
      }
    };
    
    initApp();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Failed to initialize app: {error}</Text>
      </View>
    );
  }

  if (!firebaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          {/* <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          </Stack.Navigator> */}
          <AppNavigator/>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
