import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

export default function PropertiesScreen() {
  const { t } = useLanguage();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('properties.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
  },
});
