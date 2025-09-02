import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { RewardClaim } from '../../types/api/rewards';
import { AnimatedCard } from '../ui';

interface Props {
  claim: RewardClaim;
  onApprove?: (claim: RewardClaim) => void;
  onReject?: (claim: RewardClaim) => void;
  onView?: (claim: RewardClaim) => void;
  showActions?: boolean;
}

const RewardClaimCard: React.FC<Props> = ({ 
  claim, 
  onApprove, 
  onReject, 
  onView,
  showActions = true 
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (claim.status) {
      case 'pending':
        return theme.colors.warning || '#F59E0B';
      case 'approved':
        return theme.colors.success || '#10B981';
      case 'rejected':
        return theme.colors.error || '#EF4444';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (claim.status) {
      case 'pending':
        return 'time-outline';
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusText = () => {
    switch (claim.status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Rejetée';
      default:
        return 'Inconnu';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = StyleSheet.create({
    card: {
      marginBottom: 12,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    headerLeft: {
      flex: 1,
      marginRight: 12,
    },
    childName: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      color: theme.colors.text,
      marginBottom: 4,
    },
    rewardName: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    pointsCost: {
      fontSize: 12,
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: getStatusColor() + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusIcon: {
      marginRight: 4,
    },
    statusText: {
      fontSize: 12,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      color: getStatusColor(),
    },
    dateContainer: {
      marginBottom: 16,
    },
    dateItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    dateIcon: {
      marginRight: 8,
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 6,
    },
    approveButton: {
      backgroundColor: theme.colors.success + '20' || '#10B98120',
    },
    rejectButton: {
      backgroundColor: theme.colors.error + '20' || '#EF444420',
    },
    viewButton: {
      backgroundColor: theme.colors.primary + '20',
    },
    buttonText: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
    },
    approveText: {
      color: theme.colors.success || '#10B981',
    },
    rejectText: {
      color: theme.colors.error || '#EF4444',
    },
    viewText: {
      color: theme.colors.primary,
    },
  });

  return (
    <AnimatedCard style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.childName}>
            {claim.childName}
          </Text>
          <Text style={styles.rewardName}>
            {claim.rewardName}
          </Text>
          <Text style={styles.pointsCost}>
            {claim.pointsCost} points
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon() as any} 
            size={14} 
            color={getStatusColor()}
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.dateContainer}>
        <View style={styles.dateItem}>
          <Ionicons 
            name="calendar-outline" 
            size={14} 
            color={theme.colors.textSecondary}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>
            Demandée le {formatDate(claim.claimedAt)}
          </Text>
        </View>
        
        {claim.validatedAt && (
          <View style={styles.dateItem}>
            <Ionicons 
              name="checkmark-circle-outline" 
              size={14} 
              color={theme.colors.textSecondary}
              style={styles.dateIcon}
            />
            <Text style={styles.dateText}>
              {claim.status === 'approved' ? 'Approuvée' : 'Rejetée'} le {formatDate(claim.validatedAt)}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          {claim.status === 'pending' && onApprove && onReject ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => onReject(claim)}
              >
                <Ionicons name="close" size={16} color={styles.rejectText.color} />
                <Text style={[styles.buttonText, styles.rejectText]}>
                  Rejeter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => onApprove(claim)}
              >
                <Ionicons name="checkmark" size={16} color={styles.approveText.color} />
                <Text style={[styles.buttonText, styles.approveText]}>
                  Approuver
                </Text>
              </TouchableOpacity>
            </>
          ) : onView ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => onView(claim)}
            >
              <Ionicons name="eye" size={16} color={theme.colors.primary} />
              <Text style={[styles.buttonText, styles.viewText]}>
                Voir détails
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </AnimatedCard>
  );
};

export default RewardClaimCard;