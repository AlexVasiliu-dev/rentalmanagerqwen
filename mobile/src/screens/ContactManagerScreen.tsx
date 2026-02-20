import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface ContactManagerScreenProps {
  route: {
    params: {
      manager: {
        name: string | null;
        email: string;
        phone?: string | null;
      };
    };
  };
}

export default function ContactManagerScreen({ route }: ContactManagerScreenProps) {
  const { t } = useLanguage();
  const { manager } = route.params;
  const firstName = manager.name?.split(' ')[0] || manager.email.split('@')[0];

  const handleEmail = () => {
    Linking.openURL(`mailto:${manager.email}`);
  };

  const handlePhone = () => {
    if (manager.phone) {
      Linking.openURL(`tel:${manager.phone}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Manager Name */}
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👤</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{t('contact.managerName')}</Text>
            <Text style={styles.value}>{firstName}</Text>
          </View>
        </View>

        {/* Email */}
        <View style={styles.infoCard}>
          <View style={[styles.iconContainer, styles.emailIcon]}>
            <Text style={styles.icon}>📧</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{t('contact.email')}</Text>
            <Text style={styles.value}>{manager.email}</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <Text style={styles.actionButtonText}>📧</Text>
          </TouchableOpacity>
        </View>

        {/* Phone */}
        {manager.phone && (
          <View style={styles.infoCard}>
            <View style={[styles.iconContainer, styles.phoneIcon]}>
              <Text style={styles.icon}>📱</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.label}>{t('contact.phone')}</Text>
              <Text style={styles.value}>{manager.phone}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handlePhone}>
              <Text style={styles.actionButtonText}>📞</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            {t('contact.contactManager')}
          </Text>
        </View>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emailIcon: {
    backgroundColor: '#D1FAE5',
  },
  phoneIcon: {
    backgroundColor: '#E9D5FF',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 20,
  },
  note: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
});
