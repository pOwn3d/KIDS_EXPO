import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import parentSessionService from '../../services/parentSession.service';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/store';

interface ParentZoneProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
}

const ParentZone: React.FC<ParentZoneProps> = ({ children, requiresAuth = true }) => {
  const theme = useTheme();
  const platform = usePlatform();
  const userRole = useSelector(selectUserRole);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSessionBar, setShowSessionBar] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation et réaction au changement de rôle
  useEffect(() => {
    if (!isInitialized) {
      console.log('[ParentZone] Initializing...');
      setIsInitialized(true);
    }
    checkSession();
  }, [userRole]); // Re-check quand le rôle change

  // Gestion du timer et de l'expiration de session
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      updateTimeRemaining();
    }, 30000); // Update every 30 seconds

    const handleExpired = () => {
      setIsAuthenticated(false);
      setShowSessionBar(false);
      if (Platform.OS === 'web') {
        window.alert('Votre session parent a expiré. Veuillez vous reconnecter.');
      } else {
        Alert.alert('Session expirée', 'Votre session parent a expiré. Veuillez vous reconnecter.');
      }
    };

    parentSessionService.setOnSessionExpired(handleExpired);

    return () => {
      clearInterval(interval);
      parentSessionService.setOnSessionExpired(null);
    };
  }, [isAuthenticated]);

  const checkSession = async () => {
    console.log('[ParentZone] Checking session...');
    console.log('[ParentZone] User role:', userRole);
    
    // Vérifier d'abord la session temporaire (PIN)
    const isSessionActive = await parentSessionService.isSessionActive();
    console.log('[ParentZone] PIN Session active:', isSessionActive);
    
    // Si l'utilisateur est parent OU a une session PIN active
    if (userRole === 'PARENT' || isSessionActive) {
      console.log('[ParentZone] Access granted - Parent or valid PIN session');
      setIsAuthenticated(true);
      // Afficher la barre de session seulement si c'est une session PIN (pas pour les parents)
      setShowSessionBar(isSessionActive && userRole !== 'PARENT');
      setShowPinModal(false);
      
      if (isSessionActive && userRole !== 'PARENT') {
        await updateTimeRemaining();
      }
    } else if (requiresAuth) {
      // Ni parent, ni session active -> demander le PIN
      console.log('[ParentZone] Access denied - Need PIN');
      setShowPinModal(true);
      setIsAuthenticated(false);
      setShowSessionBar(false);
    }
  };

  const updateTimeRemaining = async () => {
    const minutes = await parentSessionService.getTimeRemaining();
    setTimeRemaining(minutes);
  };

  const handlePinSubmit = async () => {
    const isValid = await parentSessionService.verifyPin(pin);
    if (isValid) {
      await parentSessionService.startSession(pin);
      setIsAuthenticated(true);
      setShowSessionBar(true);
      setShowPinModal(false);
      setPin('');
      await updateTimeRemaining();
    } else {
      if (Platform.OS === 'web') {
        window.alert('Code PIN incorrect');
      } else {
        Alert.alert('Erreur', 'Code PIN incorrect');
      }
    }
  };

  const handleExtendSession = async () => {
    await parentSessionService.extendSession();
    await updateTimeRemaining();
    if (Platform.OS === 'web') {
      window.alert('Session prolongée de 15 minutes');
    } else {
      Alert.alert('Session prolongée', 'Votre session a été prolongée de 15 minutes');
    }
  };

  const handleLogout = async () => {
    await parentSessionService.endSession();
    setIsAuthenticated(false);
    setShowSessionBar(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    sessionBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    sessionBarContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: platform.isDesktop ? 32 : 16,
      paddingVertical: 12,
    },
    sessionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    sessionIcon: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      padding: 8,
    },
    sessionText: {
      color: theme.colors.textInverse,
      fontSize: 14,
      fontWeight: '600',
    },
    sessionTimer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timerText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: 'bold',
    },
    sessionActions: {
      flexDirection: 'row',
      gap: 12,
    },
    sessionButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sessionButtonText: {
      color: theme.colors.textInverse,
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      marginTop: showSessionBar ? 60 : 0,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      width: platform.isDesktop ? 400 : '90%',
      maxWidth: 400,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 24,
    },
    modalIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    pinInput: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 24,
      textAlign: 'center',
      letterSpacing: 8,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textInverse,
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    unauthorizedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    unauthorizedIcon: {
      marginBottom: 24,
    },
    unauthorizedTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    unauthorizedText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    unlockButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    unlockButtonText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  // Si l'authentification n'est pas requise, afficher directement le contenu
  if (!requiresAuth) {
    return <>{children}</>;
  }

  // Si non authentifié, afficher l'écran de verrouillage
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Ionicons
            name="lock-closed"
            size={64}
            color={theme.colors.primary}
            style={styles.unauthorizedIcon}
          />
          <Text style={styles.unauthorizedTitle}>Zone Parent</Text>
          <Text style={styles.unauthorizedText}>
            Cette section nécessite une authentification parent.
            Veuillez entrer votre code PIN pour continuer.
          </Text>
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => setShowPinModal(true)}
          >
            <Ionicons name="key" size={20} color={theme.colors.textInverse} />
            <Text style={styles.unlockButtonText}>Déverrouiller</Text>
          </TouchableOpacity>
        </View>

        {/* Modal PIN */}
        <Modal
          visible={showPinModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Ionicons name="lock-closed" size={32} color={theme.colors.textInverse} />
                </View>
                <Text style={styles.modalTitle}>Code PIN Parent</Text>
                <Text style={styles.modalSubtitle}>
                  Entrez votre code PIN pour accéder à la zone parent
                </Text>
              </View>

              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={setPin}
                placeholder="• • • •"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowPinModal(false);
                    setPin('');
                  }}
                >
                  <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                    Annuler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handlePinSubmit}
                  disabled={pin.length !== 4}
                >
                  <Text style={styles.modalButtonText}>Valider</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Si authentifié, afficher le contenu avec la barre de session
  return (
    <View style={styles.container}>
      {showSessionBar && (
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sessionBar}
        >
          <View style={styles.sessionBarContent}>
            <View style={styles.sessionInfo}>
              <View style={styles.sessionIcon}>
                <Ionicons name="shield-checkmark" size={24} color={theme.colors.textInverse} />
              </View>
              <Text style={styles.sessionText}>Mode Parent Actif</Text>
              <View style={styles.sessionTimer}>
                <Ionicons name="time" size={20} color={theme.colors.textInverse} />
                <Text style={styles.timerText}>{timeRemaining} min</Text>
              </View>
            </View>

            <View style={styles.sessionActions}>
              <TouchableOpacity style={styles.sessionButton} onPress={handleExtendSession}>
                <Ionicons name="add-circle" size={20} color={theme.colors.textInverse} />
                <Text style={styles.sessionButtonText}>+15 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sessionButton} onPress={handleLogout}>
                <Ionicons name="log-out" size={20} color={theme.colors.textInverse} />
                <Text style={styles.sessionButtonText}>Quitter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

export default ParentZone;