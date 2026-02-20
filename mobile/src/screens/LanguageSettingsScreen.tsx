import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSettingsScreenProps {
  navigation: any;
}

export default function LanguageSettingsScreen({ navigation }: LanguageSettingsScreenProps) {
  const { language, setLanguage } = useLanguage();
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'ro': 'Română',
      'en': 'English',
    };
    return translations[key] || key;
  };

  const languages = [
    { code: 'ro' as const, name: 'Română' },
    { code: 'en' as const, name: 'English' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          {language === 'ro' 
            ? 'Selectați limba pentru aplicație' 
            : 'Select language for the app'}
        </Text>

        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageItem,
              language === lang.code && styles.languageItemActive,
            ]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text
              style={[
                styles.languageName,
                language === lang.code && styles.languageNameActive,
              ]}
            >
              {lang.name}
            </Text>
            {language === lang.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageItemActive: {
    backgroundColor: '#2563EB',
  },
  languageName: {
    fontSize: 16,
    color: '#1F2937',
  },
  languageNameActive: {
    color: '#fff',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
