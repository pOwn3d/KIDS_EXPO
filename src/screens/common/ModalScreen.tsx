import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackScreenProps } from '../../types/app/navigation';
import { useTheme } from '../../hooks/useSimpleTheme';

type Props = RootStackScreenProps<'Modal'>;

export const ModalScreen: React.FC<Props> = ({ route }) => {
  const theme = useTheme();
  const { screen, params } = route.params;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: theme.colors.text,
      fontSize: 18,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Modal Screen: {screen}</Text>
      <Text style={styles.text}>Params: {JSON.stringify(params)}</Text>
    </View>
  );
};