import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { usePlatform } from '@hooks/usePlatform';

interface AdaptiveGridProps {
  children: ReactNode;
  minItemWidth?: number;
  spacing?: number;
  style?: ViewStyle;
}

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  minItemWidth = 300,
  spacing = 16,
  style,
}) => {
  const { screenWidth, isDesktop, isTablet } = usePlatform();

  const getColumns = () => {
    if (isDesktop) {
      return Math.floor((screenWidth - spacing * 2) / minItemWidth);
    }
    if (isTablet) {
      return 2;
    }
    return 1;
  };

  const columns = getColumns();
  const childrenArray = React.Children.toArray(children);

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: Math.ceil(childrenArray.length / columns) }).map((_, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { marginBottom: spacing }]}>
          {childrenArray.slice(rowIndex * columns, (rowIndex + 1) * columns).map((child, index) => (
            <View
              key={index}
              style={[
                styles.column,
                {
                  flex: 1 / columns,
                  marginRight: index < columns - 1 ? spacing : 0,
                },
              ]}
            >
              {child}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  column: {
    flex: 1,
  },
});