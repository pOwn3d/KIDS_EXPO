import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <WebScreenWrapper
      title="Profil"
      subtitle="Mon compte et paramètres"
      icon="person-circle"
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#0EA5E9" />
            </View>
            <Text style={styles.userName}>{currentUser?.firstName} {currentUser?.lastName}</Text>
            <Text style={styles.userEmail}>{currentUser?.email}</Text>
            <Text style={styles.userRole}>{currentUser?.role === 'PARENT' ? 'Parent' : 'Enfant'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={styles.menuItemText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </WebScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
    fontWeight: '500',
  },
});