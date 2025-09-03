import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

export default function BadgesScreen() {
  return (
    <WebScreenWrapper
      title="Badges"
      subtitle="Collection de badges et récompenses"
      icon="ribbon"
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="ribbon-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Badges</Text>
            <Text style={styles.emptyText}>
              Le système de badges sera bientôt disponible
            </Text>
          </View>
        </View>
      </ScrollView>
    </WebScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});