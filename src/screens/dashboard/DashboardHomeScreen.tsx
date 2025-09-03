import React from 'react';
import ParentDashboardScreen from './ParentDashboardScreen';
import ResponsiveParentDashboard from './ResponsiveParentDashboard';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Demo component removed - using simple theme

// Import our new Box of Crayons components
import { 
  Button3D, 
  AnimatedCard, 
  Badge, 
  ProgressBar,
  CrayonColors,
  GamificationColors 
} from '../../components/ui';

// Types and hooks
import { DashboardStackParamList } from '../../types/app/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useResponsive, useResponsiveColumns } from '../../hooks/usePlatform';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectUserRole } from '../../store/store';

type Props = NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>;

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  type?: 'points' | 'level' | 'streak' | 'achievement' | 'default';
  progress?: number;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  type = 'default',
  progress,
  onPress 
}) => {
  const theme = useTheme();

  const cardWidth = useResponsive({
    mobile: '100%',
    tablet: '48%',
    desktop: '23%',
  });

  const isChildMode = false; // Simple mode, no child/parent distinction for now

  // Local styles for StatCard
  const cardStyles = StyleSheet.create({
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    cardIcon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: {
      flex: 1,
    },
    cardValue: {
      marginBottom: 4,
    },
    cardTitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    progressContainer: {
      marginTop: 12,
      width: '100%',
    },
  });

  return (
    <AnimatedCard
      onPress={onPress}
      animation={isChildMode ? "float" : "hover"}
      coloredShadow={isChildMode}
      shadowColor={color}
      style={{ 
        width: cardWidth as any,
        margin: 8,
      }}
    >
      <View style={cardStyles.cardContent}>
        {/* Badge with icon */}
        <View style={cardStyles.cardIcon}>
          <Badge
            icon={icon}
            type={type as any}
            size={isChildMode ? "large" : "medium"}
            color={color as any}
            variant="filled"
            glowing={isChildMode}
            iconOnly
          />
        </View>

        {/* Value and title */}
        <View style={cardStyles.cardInfo}>
          <Text style={[
            cardStyles.cardValue, 
            { 
              fontFamily: isChildMode ? theme.typography.fontFamilies.extraBold : theme.typography.fontFamilies.bold,
              fontSize: isChildMode ? 32 : 28,
              color: isChildMode ? color : theme.colors.text,
            }
          ]}>
            {value}
          </Text>
          <Text style={[
            cardStyles.cardTitle,
            {
              fontFamily: isChildMode ? theme.typography.fontFamilies.medium : theme.typography.fontFamilies.regular,
            }
          ]}>
            {title}
          </Text>
        </View>

        {/* Progress bar for applicable stats */}
        {progress !== undefined && (
          <View style={cardStyles.progressContainer}>
            <ProgressBar
              value={progress}
              height={isChildMode ? 8 : 6}
              color={color as any}
              animated={true}
              shiny={isChildMode}
              playful={isChildMode}
            />
          </View>
        )}
      </View>
    </AnimatedCard>
  );
};

const DashboardHomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const platform = usePlatform();
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);

  // Par défaut, afficher le dashboard parent (on inversera la logique plus tard)
  // TODO: Implémenter la logique de sélection enfant/parent basée sur l'authentification
  const isParent = userRole !== 'child' && userRole !== 'CHILD';
  
  if (isParent) {
    // Use responsive dashboard for web, regular for mobile
    if (platform.isDesktop || platform.isTablet) {
      return <ResponsiveParentDashboard />;
    }
    return <ParentDashboardScreen />;
  }

  const columns = useResponsiveColumns(1, 2, 4);
  const containerPadding = useResponsive({ mobile: 16, tablet: 24, desktop: 32 });

  const isChildMode = userRole === 'child';
  
  // Use theme directly - no conversion needed with new system

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: containerPadding,
    },
    header: {
      marginBottom: isChildMode ? 40 : 32,
      alignItems: isChildMode ? 'center' : 'flex-start',
    },
    greeting: {
      fontSize: platform.isDesktop ? (isChildMode ? 36 : 32) : (isChildMode ? 32 : 28),
      fontFamily: isChildMode ? theme.typography.fontFamilies.extraBold : theme.typography.fontFamilies.bold,
      color: isChildMode ? theme.colors.primary : theme.colors.text,
      marginBottom: 8,
      textAlign: isChildMode ? 'center' : 'left',
    },
    subGreeting: {
      fontSize: isChildMode ? 18 : 16,
      color: theme.colors.textSecondary,
      fontFamily: isChildMode ? theme.typography.fontFamilies.medium : theme.typography.fontFamilies.regular,
      textAlign: isChildMode ? 'center' : 'left',
    },
    section: {
      marginBottom: isChildMode ? 40 : 32,
    },
    sectionTitle: {
      fontSize: platform.isDesktop ? (isChildMode ? 28 : 24) : (isChildMode ? 24 : 20),
      fontFamily: isChildMode ? theme.typography.fontFamilies.bold : theme.typography.fontFamilies.bold,
      color: theme.colors.text,
      marginBottom: isChildMode ? 20 : 16,
      textAlign: isChildMode ? 'center' : 'left',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 10,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: isChildMode ? 'center' : 'flex-start',
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 8,
    },
    activityText: {
      flex: 1,
      marginLeft: 12,
    },
    activityTitle: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies.medium,
      color: theme.colors.text,
      marginBottom: 2,
    },
    activityTime: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    celebrationContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    celebrationText: {
      fontSize: isChildMode ? 20 : 18,
      fontFamily: theme.typography.fontFamilies.bold,
      color: theme.colors.achievement,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = currentUser?.firstName || 'there';
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getSubGreeting = () => {
    if (userRole === 'PARENT') {
      return "Here's how your family is doing today";
    }
    return "Ready to earn some points today?";
  };

  // Enhanced mock data with progress and Box of Crayons integration
  const stats = userRole === 'PARENT' ? [
    { 
      title: 'Total Family Points', 
      value: '2,847', 
      icon: 'trophy' as const, 
      color: GamificationColors.points,
      type: 'points' as const,
      progress: 85 
    },
    { 
      title: 'Active Missions', 
      value: '12', 
      icon: 'list' as const, 
      color: theme.colors.primary,
      type: 'default' as const,
      progress: 75
    },
    { 
      title: 'Completed This Week', 
      value: '8', 
      icon: 'checkmark-circle' as const, 
      color: theme.colors.success,
      type: 'achievement' as const,
      progress: 60
    },
    { 
      title: 'Children Active', 
      value: '3/3', 
      icon: 'people' as const, 
      color: theme.colors.secondary,
      type: 'default' as const,
      progress: 100
    },
  ] : [
    { 
      title: 'My Points', 
      value: '1,234', 
      icon: 'trophy' as const, 
      color: GamificationColors.points,
      type: 'points' as const,
      progress: 67 
    },
    { 
      title: 'Current Level', 
      value: '7', 
      icon: 'trending-up' as const, 
      color: GamificationColors.level,
      type: 'level' as const,
      progress: 45
    },
    { 
      title: 'Missions Today', 
      value: '3/5', 
      icon: 'list' as const, 
      color: theme.colors.primary,
      type: 'default' as const,
      progress: 60
    },
    { 
      title: 'Streak Days', 
      value: '5', 
      icon: 'flame' as const, 
      color: GamificationColors.streak,
      type: 'streak' as const,
      progress: 80
    },
  ];

  const quickActions = userRole === 'PARENT' ? [
    { 
      title: 'Create Mission', 
      icon: 'add-circle' as const, 
      color: CrayonColors.successGreen,
      action: () => navigation.navigate('Missions' as never, { screen: 'CreateMission' } as never)
    },
    { 
      title: 'Add Reward', 
      icon: 'gift' as const, 
      color: CrayonColors.sunYellow,
      action: () => navigation.navigate('Rewards' as never, { screen: 'CreateReward' } as never)
    },
    { 
      title: 'View Reports', 
      icon: 'bar-chart' as const, 
      color: CrayonColors.electricBlue,
      action: () => navigation.navigate('Dashboard' as never)
    },
  ] : [
    { 
      title: 'Demander Mission', 
      icon: 'hand-right' as const, 
      color: CrayonColors.electricBlue,
      action: () => navigation.navigate('Missions' as never, { screen: 'RequestMission' } as never)
    },
    { 
      title: 'Boutique Récompenses', 
      icon: 'storefront' as const, 
      color: CrayonColors.sunYellow,
      action: () => navigation.navigate('Rewards' as never, { screen: 'ClaimReward' } as never)
    },
    { 
      title: 'Mes Missions', 
      icon: 'list' as const, 
      color: CrayonColors.successGreen,
      action: () => navigation.navigate('Missions' as never)
    },
  ];

  const recentActivities = [
    { 
      title: 'Math homework completed', 
      time: '2 hours ago', 
      icon: 'school' as const,
      color: CrayonColors.successGreen,
      points: '+50'
    },
    { 
      title: 'Room cleaned perfectly', 
      time: '4 hours ago', 
      icon: 'home' as const,
      color: CrayonColors.electricBlue,
      points: '+30'
    },
    { 
      title: 'New achievement unlocked', 
      time: '1 day ago', 
      icon: 'trophy' as const,
      color: GamificationColors.achievement,
      points: '+100'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subGreeting}>{getSubGreeting()}</Text>
        </View>

        {/* Celebration Section for Level Up */}
        {userRole === 'CHILD' && isChildMode && (
          <View style={styles.celebrationContainer}>
            <Badge
              type="level"
              size="collectible"
              title="Level 7"
              glowing
              shiny
              newBadge
            />
            <Text style={styles.celebrationText}>
              🎉 You leveled up! Keep going!
            </Text>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userRole === 'PARENT' ? '👨‍👩‍👧‍👦 Family Overview' : '🎯 Your Progress'}
          </Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                type={stat.type}
                progress={stat.progress}
                onPress={() => {
                  if (userRole === 'PARENT') {
                    navigation.navigate('FamilyOverview' as never);
                  } else {
                    navigation.navigate('Profile' as never);
                  }
                }}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userRole === 'PARENT' ? '⚡ Quick Actions' : '🚀 What\'s Next?'}
          </Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <Button3D
                key={index}
                title={action.title}
                icon={action.icon}
                color={action.color as any}
                size={isChildMode ? "large" : "medium"}
                playful={isChildMode}
                onPress={action.action}
              />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userRole === 'PARENT' ? '📊 Recent Activity' : '⭐ Latest Achievements'}
          </Text>
          <AnimatedCard
            animation={isChildMode ? "float" : "hover"}
            playful={isChildMode}
          >
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Badge
                  icon={activity.icon}
                  color={activity.color as any}
                  size="medium"
                  iconOnly
                  glowing={isChildMode}
                />
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                {isChildMode && (
                  <Badge
                    value={activity.points}
                    color="points"
                    size="small"
                    variant="filled"
                    shiny
                  />
                )}
              </View>
            ))}
          </AnimatedCard>
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
};

export default DashboardHomeScreen;