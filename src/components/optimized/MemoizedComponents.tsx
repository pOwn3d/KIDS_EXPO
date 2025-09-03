/**
 * Memoized Components
 * Performance optimized components with React.memo
 */

import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Memoized Card Component
 * Only re-renders when props actually change
 */
export const MemoizedCard = memo<{
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  gradient?: boolean;
}>(
  ({ title, subtitle, icon, iconColor = '#0EA5E9', onPress, rightContent, gradient }) => {
    const CardContent = useMemo(() => (
      <>
        <View style={styles.cardLeft}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
              <Ionicons name={icon as any} size={24} color={iconColor} />
            </View>
          )}
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightContent}
      </>
    ), [title, subtitle, icon, iconColor, rightContent]);

    if (gradient) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <LinearGradient
            colors={['#0EA5E9', '#06B6D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            {CardContent}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {CardContent}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.icon === nextProps.icon &&
      prevProps.iconColor === nextProps.iconColor &&
      prevProps.gradient === nextProps.gradient
    );
  }
);

/**
 * Memoized List Item
 * Optimized for large lists
 */
export const MemoizedListItem = memo<{
  id: number;
  title: string;
  value?: string | number;
  status?: 'pending' | 'completed' | 'active';
  onPress?: (id: number) => void;
}>(
  ({ id, title, value, status, onPress }) => {
    const handlePress = useCallback(() => {
      onPress?.(id);
    }, [id, onPress]);

    const statusColor = useMemo(() => {
      switch (status) {
        case 'completed':
          return '#10B981';
        case 'active':
          return '#0EA5E9';
        case 'pending':
        default:
          return '#6B7280';
      }
    }, [status]);

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.listItemTitle} numberOfLines={1}>
          {title}
        </Text>
        {value !== undefined && (
          <Text style={styles.listItemValue}>{value}</Text>
        )}
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  }
);

/**
 * Memoized Avatar Component
 */
export const MemoizedAvatar = memo<{
  uri?: string;
  name?: string;
  size?: number;
  onPress?: () => void;
}>(
  ({ uri, name, size = 40, onPress }) => {
    const initials = useMemo(() => {
      if (!name) return '?';
      const parts = name.split(' ');
      return parts
        .map(p => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }, [name]);

    const backgroundColor = useMemo(() => {
      if (!name) return '#9CA3AF';
      const colors = ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    }, [name]);

    if (uri) {
      return (
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
          <Image
            source={{ uri }}
            style={[styles.avatar, { width: size, height: size }]}
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.avatarPlaceholder,
          {
            width: size,
            height: size,
            backgroundColor,
          },
        ]}
        onPress={onPress}
        disabled={!onPress}
      >
        <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
          {initials}
        </Text>
      </TouchableOpacity>
    );
  }
);

/**
 * Memoized Stats Card
 */
export const MemoizedStatsCard = memo<{
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}>(
  ({ label, value, icon, color = '#0EA5E9', trend, trendValue }) => {
    const trendIcon = useMemo(() => {
      switch (trend) {
        case 'up':
          return 'trending-up';
        case 'down':
          return 'trending-down';
        default:
          return null;
      }
    }, [trend]);

    const trendColor = useMemo(() => {
      switch (trend) {
        case 'up':
          return '#10B981';
        case 'down':
          return '#EF4444';
        default:
          return '#6B7280';
      }
    }, [trend]);

    return (
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          {icon && (
            <Ionicons name={icon as any} size={20} color={color} />
          )}
          <Text style={styles.statsLabel}>{label}</Text>
        </View>
        <Text style={styles.statsValue}>{value}</Text>
        {trend && trendValue && (
          <View style={styles.statsTrend}>
            {trendIcon && (
              <Ionicons name={trendIcon as any} size={16} color={trendColor} />
            )}
            <Text style={[styles.statsTrendValue, { color: trendColor }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.trend === nextProps.trend &&
      prevProps.trendValue === nextProps.trendValue
    );
  }
);

/**
 * Optimized FlatList with memoized renderItem
 */
export function createOptimizedFlatList<T>({
  keyExtractor,
  renderItem,
}: {
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
}) {
  const MemoizedRenderItem = memo(renderItem);
  
  return memo<{
    data: T[];
    refreshing?: boolean;
    onRefresh?: () => void;
    ListEmptyComponent?: React.ComponentType<any>;
  }>(({ data, refreshing, onRefresh, ListEmptyComponent }) => (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={MemoizedRenderItem}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={ListEmptyComponent}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 80, // Fixed height for better performance
        offset: 80 * index,
        index,
      })}
    />
  ));
}

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // List item styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    height: 80, // Fixed height for performance
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  listItemTitle: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  listItemValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  
  // Avatar styles
  avatar: {
    borderRadius: 999,
  },
  avatarPlaceholder: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // Stats card styles
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 150,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTrendValue: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});