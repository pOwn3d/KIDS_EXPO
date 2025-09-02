import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePunishments } from '../../hooks';

interface Props {
  childId: string | number;
  showDetails?: boolean;
  onPress?: () => void;
  compact?: boolean;
}

const PunishmentIndicator: React.FC<Props> = ({ 
  childId, 
  showDetails = false, 
  onPress,
  compact = false 
}) => {
  const theme = useTheme();
  const { getActiveRestrictions, isChildRestricted } = usePunishments();
  
  const hasRestrictions = isChildRestricted(childId);
  const activeRestrictions = getActiveRestrictions(childId);
  
  if (!hasRestrictions) {
    return null;
  }
  
  const restrictionCount = activeRestrictions.length;
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.error + '15',
      borderRadius: compact ? 12 : 8,
      paddingHorizontal: compact ? 8 : 12,
      paddingVertical: compact ? 4 : 8,
      borderWidth: 1,
      borderColor: theme.colors.error + '30',
    },
    icon: {
      marginRight: compact ? 4 : 8,
    },
    textContainer: {
      flex: 1,
    },
    mainText: {
      fontSize: compact ? 12 : 14,
      fontFamily: theme.typography.fontFamilies?.medium || 'System',
      color: theme.colors.error,
    },
    detailText: {
      fontSize: 11,
      color: theme.colors.error + 'CC',
      marginTop: 2,
    },
    touchable: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
  
  const content = (
    <View style={styles.container}>
      <Ionicons 
        name="warning" 
        size={compact ? 16 : 20} 
        color={theme.colors.error} 
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>
          {restrictionCount === 1 
            ? 'Punition active' 
            : `${restrictionCount} punitions actives`
          }
        </Text>
        {showDetails && !compact && activeRestrictions.length > 0 && (
          <Text style={styles.detailText} numberOfLines={1}>
            {activeRestrictions[0].punishmentTitle || 'Restriction en cours'}
          </Text>
        )}
      </View>
      {onPress && (
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={theme.colors.error} 
        />
      )}
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {content}
      </TouchableOpacity>
    );
  }
  
  return content;
};

export default PunishmentIndicator;