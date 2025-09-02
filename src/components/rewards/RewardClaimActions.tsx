import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRewards } from '../../hooks';
import { usePinValidation } from '../../hooks/usePinValidation';
import { RewardClaim } from '../../types/api/rewards';
import { Button3D } from '../ui';
import Toast from 'react-native-toast-message';

interface Props {
  claim: RewardClaim;
  onSuccess?: () => void;
}

const RewardClaimActions: React.FC<Props> = ({ claim, onSuccess }) => {
  const { validateClaim, rejectClaim } = useRewards();
  const [isProcessing, setIsProcessing] = useState(false);

  // Hook pour la validation PIN pour l'approbation
  const { validateWithPin: validateApprove, PinModal: ApprovalPinModal } = usePinValidation({
    title: 'Validation Requise',
    message: 'Entrez votre code PIN pour approuver cette récompense',
    action: 'Approuver',
  });

  // Hook pour la validation PIN pour le rejet
  const { validateWithPin: validateReject, PinModal: RejectionPinModal } = usePinValidation({
    title: 'Validation Requise',
    message: 'Entrez votre code PIN pour rejeter cette récompense',
    action: 'Rejeter',
  });

  const handleApprove = () => {
    validateApprove(async () => {
      try {
        setIsProcessing(true);
        await validateClaim(claim.id).unwrap();
        
        Toast.show({
          type: 'success',
          text1: 'Récompense approuvée',
          text2: `La récompense de ${claim.childName} a été validée`,
        });
        
        onSuccess?.();
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: error.message || 'Impossible de valider la récompense',
        });
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleReject = () => {
    validateReject(async () => {
      Alert.alert(
        'Confirmer le rejet',
        `Êtes-vous sûr de vouloir rejeter la demande de ${claim.childName} ?\n\nLes points seront remboursés automatiquement.`,
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Rejeter',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsProcessing(true);
                await rejectClaim(claim.id, 'Rejeté par le parent').unwrap();
                
                Toast.show({
                  type: 'info',
                  text1: 'Récompense rejetée',
                  text2: 'Les points ont été remboursés à l\'enfant',
                });
                
                onSuccess?.();
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur',
                  text2: error.message || 'Impossible de rejeter la récompense',
                });
              } finally {
                setIsProcessing(false);
              }
            },
          },
        ]
      );
    });
  };

  // Seulement afficher les actions pour les demandes en attente
  if (claim.status !== 'pending') {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    button: {
      flex: 1,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <Button3D
          title="Rejeter"
          variant="ghost"
          onPress={handleReject}
          disabled={isProcessing}
          icon="close"
          style={styles.button}
        />
        
        <Button3D
          title="Approuver"
          variant="primary"
          onPress={handleApprove}
          disabled={isProcessing}
          icon="checkmark"
          style={styles.button}
        />
      </View>

      {/* PIN Modals */}
      <ApprovalPinModal />
      <RejectionPinModal />
    </>
  );
};

export default RewardClaimActions;