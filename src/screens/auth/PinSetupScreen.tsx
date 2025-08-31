import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthStackScreenProps } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';

type Props = AuthStackScreenProps<'PinSetup'>;

const PinSetupScreen: React.FC<Props> = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: theme.colors.text, fontSize: 18 }}>PIN Setup Screen - Coming Soon</Text>
    </View>
  );
};

export default PinSetupScreen;