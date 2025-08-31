import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { authService } from '../../services/auth.service';

interface PinValidationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  message?: string;
  action?: string;
}

const PinValidationModal: React.FC<PinValidationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  title = 'Validation Parent Requise',
  message = 'Veuillez entrer votre code PIN parent pour continuer',
  action = 'Valider',
}) => {
  const theme = useTheme();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (pin.length !== 4) {
      setError('Le code PIN doit contenir 4 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await authService.validateParentPin(pin);
      
      if (isValid) {
        setPin('');
        onSuccess();
        onClose();
      } else {
        setError('Code PIN incorrect');
        setPin('');
      }
    } catch (error) {
      console.error('Erreur validation PIN:', error);
      setError('Erreur lors de la validation du code PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons 
              name="lock-closed" 
              size={48} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              {message}
            </Text>
          </View>

          {/* PIN Input */}
          <View style={styles.pinContainer}>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={pin}
                onChangeText={(text) => {
                  setError('');
                  setPin(text.replace(/[^0-9]/g, '').slice(0, 4));
                }}
                placeholder="••••"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="numeric"
                secureTextEntry={!showPin}
                maxLength={4}
                editable={!isLoading}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => setShowPin(!showPin)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPin ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* PIN Dots Indicator */}
            <View style={styles.dotsContainer}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: 
                        index < pin.length 
                          ? theme.colors.primary 
                          : theme.colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <Text style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </Text>
            ) : null}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: theme.colors.backgroundLight }
              ]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.validateButton,
                { 
                  backgroundColor: theme.colors.primary,
                  opacity: pin.length === 4 && !isLoading ? 1 : 0.5 
                }
              ]}
              onPress={handleValidate}
              disabled={pin.length !== 4 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  {action}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Ionicons 
              name="information-circle-outline" 
              size={16} 
              color={theme.colors.textLight} 
            />
            <Text style={[styles.infoText, { color: theme.colors.textLight }]}>
              Le code PIN parent est requis pour valider cette action
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  pinContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
  },
  eyeButton: {
    padding: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  error: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    
  },
  validateButton: {
    
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
});

export default PinValidationModal;