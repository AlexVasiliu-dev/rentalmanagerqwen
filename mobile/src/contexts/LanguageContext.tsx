import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type Language = 'ro' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ro: {
    // Auth
    'auth.login': 'Autentificare',
    'auth.register': 'Înregistrare',
    'auth.logout': 'Deconectare',
    'auth.email': 'Email',
    'auth.password': 'Parolă',
    'auth.name': 'Nume',
    'auth.signIn': 'Autentifică-te',
    'auth.signUp': 'Înregistrează-te',
    'auth.noAccount': 'Nu ai cont?',
    'auth.hasAccount': 'Ai deja cont?',
    
    // Navigation
    'nav.home': 'Acasă',
    'nav.properties': 'Proprietăți',
    'nav.bills': 'Facturi',
    'nav.meterReadings': 'Citiri Contoare',
    'nav.profile': 'Profil',
    'nav.settings': 'Setări',
    'nav.language': 'Limbă',
    
    // Properties
    'properties.title': 'Proprietăți',
    'properties.address': 'Adresă',
    'properties.city': 'Oraș',
    'properties.rent': 'Chirie',
    'properties.available': 'Disponibil',
    'properties.occupied': 'Ocupat',
    'properties.details': 'Detalii Proprietate',
    'properties.images': 'Imagini',
    
    // Bills
    'bills.title': 'Facturi',
    'bills.amount': 'Sumă',
    'bills.dueDate': 'Data Scadență',
    'bills.paid': 'Plătit',
    'bills.unpaid': 'Neplătit',
    'bills.pay': 'Plătește',
    
    // Meter Readings
    'meters.title': 'Citiri Contoare',
    'meters.submit': 'Adaugă Citea',
    'meters.type': 'Tip Contor',
    'meters.value': 'Valoare',
    'meters.photo': 'Fotografie',
    'meters.takePhoto': 'Fă o Poză',
    'meters.chooseFromGallery': 'Alege din Galerie',
    'meters.electricity': 'Energie Electrică',
    'meters.water': 'Apă',
    'meters.gas': 'Gaz',
    
    // Common
    'common.loading': 'Se încarcă...',
    'common.error': 'Eroare',
    'common.success': 'Succes',
    'common.save': 'Salvează',
    'common.cancel': 'Anulează',
    'common.delete': 'Șterge',
    'common.confirm': 'Confirmă',
    'common.search': 'Caută',
    
    // Messages
    'messages.welcome': 'Bine ai venit la RentManager',
    'messages.loginSuccess': 'Autentificare reușită',
    'messages.loginError': 'Email sau parolă incorecte',
    'messages.registerSuccess': 'Cont creat cu succes',
    'messages.registerError': 'Înregistrarea a eșuat',
    'messages.logoutSuccess': 'Deconectare reușită',
    
    // Contact
    'contact.contactManager': 'Contactează Managerul',
    'contact.contactOwner': 'Contactează Proprietarul',
    'contact.managerName': 'Nume Manager',
    'contact.email': 'Email',
    'contact.phone': 'Telefon',
    'contact.call': 'Apelare',
    'contact.email': 'Email',
    'contact.sendMessage': 'Trimite Mesaj',
    'contact.subject': 'Subiect',
    'contact.message': 'Mesaj',
    'contact.send': 'Trimite',
    'contact.sending': 'Se trimite...',
    'contact.sent': 'Mesaj Trimis!',
    'contact.cancel': 'Anulează',
  },
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    
    // Navigation
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.bills': 'Bills',
    'nav.meterReadings': 'Meter Readings',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.language': 'Language',
    
    // Properties
    'properties.title': 'Properties',
    'properties.address': 'Address',
    'properties.city': 'City',
    'properties.rent': 'Rent',
    'properties.available': 'Available',
    'properties.occupied': 'Occupied',
    'properties.details': 'Property Details',
    'properties.images': 'Images',
    
    // Bills
    'bills.title': 'Bills',
    'bills.amount': 'Amount',
    'bills.dueDate': 'Due Date',
    'bills.paid': 'Paid',
    'bills.unpaid': 'Unpaid',
    'bills.pay': 'Pay',
    
    // Meter Readings
    'meters.title': 'Meter Readings',
    'meters.submit': 'Submit Reading',
    'meters.type': 'Meter Type',
    'meters.value': 'Value',
    'meters.photo': 'Photo',
    'meters.takePhoto': 'Take Photo',
    'meters.chooseFromGallery': 'Choose from Gallery',
    'meters.electricity': 'Electricity',
    'meters.water': 'Water',
    'meters.gas': 'Gas',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.search': 'Search',
    
    // Messages
    'messages.welcome': 'Welcome to RentManager',
    'messages.loginSuccess': 'Login successful',
    'messages.loginError': 'Invalid email or password',
    'messages.registerSuccess': 'Account created successfully',
    'messages.registerError': 'Registration failed',
    'messages.logoutSuccess': 'Logout successful',
    
    // Contact
    'contact.contactManager': 'Contact Manager',
    'contact.contactOwner': 'Contact Owner',
    'contact.managerName': 'Manager Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.call': 'Call',
    'contact.sendMessage': 'Send Message',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Send',
    'contact.sending': 'Sending...',
    'contact.sent': 'Message Sent!',
    'contact.cancel': 'Cancel',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ro');

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  async function loadStoredLanguage() {
    try {
      const stored = await SecureStore.getItemAsync('language');
      if (stored && (stored === 'ro' || stored === 'en')) {
        setLanguageState(stored);
      }
    } catch (error) {
      console.error('Error loading stored language:', error);
    }
  }

  async function setLanguage(newLanguage: Language) {
    await SecureStore.setItemAsync('language', newLanguage);
    setLanguageState(newLanguage);
  }

  function t(key: string): string {
    return translations[language][key] || key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
