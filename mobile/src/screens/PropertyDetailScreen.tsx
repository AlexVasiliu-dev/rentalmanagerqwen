import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PropertyDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Property Details</Text>
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
