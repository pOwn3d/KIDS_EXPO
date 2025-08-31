import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../hooks/useSimpleTheme';

const FamilyOverviewScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: theme.colors.text, fontSize: 18 }}>Family Overview Screen - Coming Soon</Text>
    </View>
  );
};

export default FamilyOverviewScreen;