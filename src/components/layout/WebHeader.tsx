import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

interface WebHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  notificationCount?: number;
  showProfile?: boolean;
  showNotifications?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  gradientColors?: string[];
}

const WebHeader: React.FC<WebHeaderProps> = ({
  title,
  subtitle = 'Gérez votre famille avec simplicité et efficacité',
  icon = 'grid',
  notificationCount = 0,
  showProfile = true,
  showNotifications = true,
  onNotificationPress,
  onProfilePress,
  gradientColors = ['#4F46E5', '#7C3AED', '#9333EA'],
}) => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      navigation.navigate('Notifications' as never);
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      navigation.navigate('Profile' as never);
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Ionicons name={icon} size={28} color="#FFFFFF" style={styles.headerIcon} />
            <View style={styles.titleTextContainer}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          {showNotifications && (
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={handleNotificationPress}
            >
              <Ionicons name="notifications" size={22} color="#FFFFFF" />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {showProfile && (
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={handleProfilePress}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 16,
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    height: 60,
  },
  notificationButton: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
});

export default WebHeader;