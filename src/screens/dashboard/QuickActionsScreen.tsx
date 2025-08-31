import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useSimpleTheme';

const QuickActionsScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: theme.colors.text, fontSize: 18 }}>Quick Actions Screen - Coming Soon</Text>
    </View>
  );
};

export default QuickActionsScreen;