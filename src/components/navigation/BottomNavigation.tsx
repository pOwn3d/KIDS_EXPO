import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useSimpleTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

const BottomNavigation: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [animatedValues] = useState<{ [key: string]: Animated.Value }>({
    home: new Animated.Value(0),
    children: new Animated.Value(0),
    missions: new Animated.Value(0),
    rewards: new Animated.Value(0),
    parent: new Animated.Value(0),
  });

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Tableau de bord',
      route: 'Dashboard',
      icon: 'home-outline',
      iconActive: 'home',
    },
    {
      id: 'children',
      label: 'Enfants',
      route: 'Children',
      icon: 'people-outline',
      iconActive: 'people',
    },
    {
      id: 'missions',
      label: 'Missions',
      route: 'Missions',
      icon: 'trophy-outline',
      iconActive: 'trophy',
      badge: 3,
    },
    {
      id: 'rewards',
      label: 'Récompenses',
      route: 'Rewards',
      icon: 'gift-outline',
      iconActive: 'gift',
    },
    {
      id: 'parent',
      label: 'Parent',
      route: 'Parent',
      icon: 'shield-checkmark-outline',
      iconActive: 'shield-checkmark',
    },
  ];

  useEffect(() => {
    // Update active tab based on current route
    const currentRoute = route.name;
    const activeItem = navItems.find(item => item.route === currentRoute);
    if (activeItem) {
      setActiveTab(activeItem.id);
      // Animate the active tab
      Animated.spring(animatedValues[activeItem.id], {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
      // Reset other tabs
      Object.keys(animatedValues).forEach(key => {
        if (key !== activeItem.id) {
          Animated.spring(animatedValues[key], {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
          }).start();
        }
      });
    }
  }, [route.name]);

  const handleNavPress = (item: NavItem) => {
    setActiveTab(item.id);
    // Navigate to the route
    navigation.navigate(item.route as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navBar, { borderTopColor: theme.colors.border }]}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const animatedValue = animatedValues[item.id];
          
          const scale = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          });
          
          const translateY = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -2],
          });

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => handleNavPress(item)}
              activeOpacity={0.7}
            >
              {/* Active Indicator */}
              {isActive && (
                <LinearGradient
                  colors={[theme.colors.secondary, theme.colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeIndicator}
                />
              )}
              
              {/* Icon Container */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale }, { translateY }],
                  },
                ]}
              >
                <Ionicons
                  name={isActive ? item.iconActive : item.icon}
                  size={24}
                  color={isActive ? theme.colors.secondary : theme.colors.textLight}
                />
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                    <Text style={styles.badgeText}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </Text>
                  </View>
                )}
              </Animated.View>
              
              {/* Label */}
              <Animated.Text
                style={[
                  styles.label,
                  {
                    color: isActive ? theme.colors.secondary : theme.colors.textLight,
                    fontWeight: isActive ? '600' : '500',
                    opacity: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ]}
              >
                {item.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Safe area for iPhone */}
      {Platform.OS === 'ios' && <View style={[styles.safeAreaBottom, { height: insets.bottom }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 48,
    height: 3,
    borderRadius: 2,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
  },
  safeAreaBottom: {
    backgroundColor: 'transparent',
  },
});

export default BottomNavigation;