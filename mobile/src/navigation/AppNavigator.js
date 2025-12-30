import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main App Screens
import HomeScreen from '../screens/student/HomeScreen';
import ServicesScreen from '../screens/student/ServicesScreen';
import QueueStatusScreen from '../screens/student/QueueStatusScreen';
import QueueHistoryScreen from '../screens/student/QueueHistoryScreen';
import ProfileScreen from '../screens/student/ProfileScreen';

const Stack = createNativeStackNavigator();

/**
 * Main App Navigator
 * Handles navigation between screens based on authentication status
 */
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return null; // You can add a loading screen component here
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack - User not logged in
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
        </>
      ) : (
        // Main App Stack - User logged in
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'QTech' }}
          />
          <Stack.Screen 
            name="Services" 
            component={ServicesScreen}
            options={{ title: 'Services' }}
          />
          <Stack.Screen 
            name="QueueStatus" 
            component={QueueStatusScreen}
            options={{ title: 'Queue Status' }}
          />
          <Stack.Screen 
            name="QueueHistory" 
            component={QueueHistoryScreen}
            options={{ title: 'Queue History' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

