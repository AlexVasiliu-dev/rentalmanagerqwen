import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ContactOwnerScreenProps {
  route: {
    params: {
      propertyId: string;
    };
  };
  navigation: any;
}

export default function ContactOwnerScreen({ route, navigation }: ContactOwnerScreenProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { propertyId } = route.params;
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL = 'http://localhost:3000/api'; // Update for production
      
      const response = await axios.post(`${API_URL}/contact-owner`, {
        propertyId,
        subject,
        message,
        tenantName: user?.name || undefined,
        tenantEmail: user?.email,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.error || t('contact.sendError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✉️</Text>
        </View>
        <Text style={styles.successTitle}>{t('contact.sent')}</Text>
        <Text style={styles.successDescription}>{t('contact.messageSentDescription')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🏠</Text>
          <View style={styles.info}>
            <Text style={styles.infoTitle}>{t('contact.propertyAddress')}</Text>
            <Text style={styles.infoDescription}>{t('contact.ownerNotified')}</Text>
          </View>
        </View>

        {/* Subject */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('contact.subject')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('contact.subjectPlaceholder')}
            placeholderTextColor="#9CA3AF"
            value={subject}
            onChangeText={setSubject}
            editable={!isSubmitting}
          />
        </View>

        {/* Message */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('contact.message')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('contact.messagePlaceholder')}
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('contact.send')}</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>{t('contact.cancel')}</Text>
        </TouchableOpacity>
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 12,
    color: '#3B82F6',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 120,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
