import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import PropertiesScreen from './src/screens/PropertiesScreen';
import PropertyDetailScreen from './src/screens/PropertyDetailScreen';
import BillsScreen from './src/screens/BillsScreen';
import MeterReadingsScreen from './src/screens/MeterReadingsScreen';
import SubmitReadingScreen from './src/screens/SubmitReadingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LanguageSettingsScreen from './src/screens/LanguageSettingsScreen';
import ContactManagerScreen from './src/screens/ContactManagerScreen';
import ContactOwnerScreen from './src/screens/ContactOwnerScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth();
  const { language } = useLanguage();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563EB',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: language === 'ro' ? 'Autentificare' : 'Login' }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: language === 'ro' ? 'Înregistrare' : 'Register' }}
            />
          </>
        ) : (
          // Main Stack
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: language === 'ro' ? 'Acasă' : 'Home' }}
            />
            <Stack.Screen 
              name="Properties" 
              component={PropertiesScreen}
              options={{ title: language === 'ro' ? 'Proprietăți' : 'Properties' }}
            />
            <Stack.Screen 
              name="PropertyDetail" 
              component={PropertyDetailScreen}
              options={{ title: language === 'ro' ? 'Detalii Proprietate' : 'Property Details' }}
            />
            <Stack.Screen 
              name="Bills" 
              component={BillsScreen}
              options={{ title: language === 'ro' ? 'Facturi' : 'Bills' }}
            />
            <Stack.Screen 
              name="MeterReadings" 
              component={MeterReadingsScreen}
              options={{ title: language === 'ro' ? 'Citiri Contoare' : 'Meter Readings' }}
            />
            <Stack.Screen 
              name="SubmitReading" 
              component={SubmitReadingScreen}
              options={{ title: language === 'ro' ? 'Adaugă Citea' : 'Submit Reading' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: language === 'ro' ? 'Profil' : 'Profile' }}
            />
            <Stack.Screen
              name="LanguageSettings"
              component={LanguageSettingsScreen}
              options={{ title: language === 'ro' ? 'Limbă' : 'Language' }}
            />
            <Stack.Screen
              name="ContactManager"
              component={ContactManagerScreen}
              options={{ title: language === 'ro' ? 'Contactează Managerul' : 'Contact Manager' }}
            />
            <Stack.Screen
              name="ContactOwner"
              component={ContactOwnerScreen}
              options={{ title: language === 'ro' ? 'Contactează Proprietarul' : 'Contact Owner' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
