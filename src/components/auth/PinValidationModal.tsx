import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useSimpleTheme';
import { Button3D } from '../ui';
import { authService } from '../../services/auth.service';

interface PinValidationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const PinValidationModal: React.FC<PinValidationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  title = 'Validation Parentale',
  description = 'Entrez votre code PIN pour continuer',
}) => {
  const theme = useTheme();
  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (visible) {
      // Reset le PIN à l'ouverture
      setPin(['', '', '', '']);
      setError('');
      // Focus sur le premier input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [visible]);

  const handlePinChange = (value: string, index: number) => {
    // Ne garder que les chiffres
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError('');

    // Auto-focus sur le prochain input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si tous les chiffres sont entrés, valider automatiquement
    if (index === 3 && digit) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        validatePin(fullPin);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !pin[index] && index > 0) {
      // Si on efface et que le champ est vide, revenir au champ précédent
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validatePin = async (pinCode: string) => {
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // TODO: Valider le PIN avec l'API
      const isValid = await authService.validateParentPin(pinCode);
      
      if (isValid) {
        // Succès
        onSuccess();
        onClose();
      } else {
        // PIN incorrect
        setError('Code PIN incorrect');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Erreur de validation');
      console.error('PIN validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    const fullPin = pin.join('');
    if (fullPin.length !== 4) {
      setError('Veuillez entrer un code PIN à 4 chiffres');
      return;
    }
    validatePin(fullPin);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.primary]}
              style={styles.iconContainer}
            >
              <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
            </LinearGradient>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textLight }]}>
            {description}
          </Text>

          {/* PIN Input */}
          <View style={styles.pinContainer}>
            {pin.map((digit, index) => (
              <View key={index} style={styles.pinInputWrapper}>
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.pinInput,
                    {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      borderColor: error 
                        ? theme.colors.error 
                        : digit 
                          ? theme.colors.primary 
                          : theme.colors.border,
                    },
                  ]}
                  value={digit}
                  onChangeText={(value) => handlePinChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  secureTextEntry
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>

          {/* Error Message */}
          {error ? (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : null}

          {/* Forgot PIN Link */}
          <TouchableOpacity 
            style={styles.forgotButton}
            onPress={() => Alert.alert('Aide', 'Contactez le support pour réinitialiser votre PIN')}
          >
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
              Code PIN oublié ?
            </Text>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actions}>
            <Button3D
              title="Annuler"
              variant="ghost"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
              disabled={isLoading}
            />
            <Button3D
              title="Valider"
              variant="primary"
              onPress={handleSubmit}
              style={{ flex: 1, marginLeft: 8 }}
              loading={isLoading}
              disabled={pin.join('').length !== 4}
            />
          </View>

          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.info + '10' }]}>
            <Ionicons name="information-circle" size={16} color={theme.colors.info} />
            <Text style={[styles.infoText, { color: theme.colors.info }]}>
              Ce code PIN protège les actions parentales
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pinInputWrapper: {
    marginHorizontal: 8,
  },
  pinInput: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  error: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  forgotButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});

export default PinValidationModal;