import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('nav.profile')}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>{user?.role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
  },
  role: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
