import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useSimpleTheme';

// Import stack navigators  
import DashboardStackNavigator from '../stacks/DashboardStackNavigator';
import MissionsStackNavigator from '../stacks/MissionsStackNavigator';
import RewardsStackNavigator from '../stacks/RewardsStackNavigator';
import ProfileStackNavigator from '../stacks/ProfileStackNavigator';
import LeaderboardStackNavigator from '../stacks/LeaderboardStackNavigator';
import NotificationsStackNavigator from '../stacks/NotificationsStackNavigator';
import ValidationsStackNavigator from '../stacks/ValidationsStackNavigator';

// Import new screens for More tab
import MoreScreen from '../../screens/more/MoreScreen';
import ChildrenDropdown from '../../components/navigation/ChildrenDropdown';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/store';

// Types
import { MainTabParamList } from '../../types/app/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator();

// Composant pour wrapper un écran avec le dropdown enfants
const ScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const [selectedChild, setSelectedChild] = useState<any>(null);

  // Vérification de sécurité pour le thème
  if (!theme || !theme.colors) {
    console.error('Theme not loaded in ScreenWrapper:', theme);
    return null;
  }

  return (
    <SafeAreaView style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      <ChildrenDropdown 
        selectedChild={selectedChild}
        onChildSelect={setSelectedChild}
      />
      <View style={styles.screenContent}>
        {children}
      </View>
    </SafeAreaView>
  );
};

// Wrappers pour chaque écran
const DashboardWithDropdown = () => (
  <ScreenWrapper>
    <DashboardStackNavigator />
  </ScreenWrapper>
);

const MissionsWithDropdown = () => (
  <ScreenWrapper>
    <MissionsStackNavigator />
  </ScreenWrapper>
);

const RewardsWithDropdown = () => (
  <ScreenWrapper>
    <RewardsStackNavigator />
  </ScreenWrapper>
);

const LeaderboardWithDropdown = () => (
  <ScreenWrapper>
    <LeaderboardStackNavigator />
  </ScreenWrapper>
);

const NotificationsWithDropdown = () => (
  <ScreenWrapper>
    <NotificationsStackNavigator />
  </ScreenWrapper>
);

const ValidationsWithDropdown = () => (
  <ScreenWrapper>
    <ValidationsStackNavigator />
  </ScreenWrapper>
);

const ProfileWithDropdown = () => (
  <ScreenWrapper>
    <ProfileStackNavigator />
  </ScreenWrapper>
);

// More Stack Navigator with all additional screens
const MoreStackNavigator = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MoreHome" component={MoreScreen} />
    </Stack.Navigator>
  );
};

const MoreWithDropdown = () => (
  <ScreenWrapper>
    <MoreStackNavigator />
  </ScreenWrapper>
);

/**
 * Simple mobile bottom tab navigator - like the screenshot
 */
const SimpleMobileTabNavigator: React.FC = () => {
  const theme = useTheme();
  const userRole = useSelector(selectUserRole);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.secondary, // Purple from React project
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Missions':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Rewards':
              iconName = focused ? 'gift' : 'gift-outline';
              break;
            case 'Leaderboard':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Validations':
              iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'More':
              iconName = focused ? 'apps' : 'apps-outline';
              break;
          }
          
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardWithDropdown}
        options={{
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen 
        name="Missions" 
        component={MissionsWithDropdown}
        options={{
          tabBarLabel: 'Missions',
        }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsWithDropdown}
        options={{
          tabBarLabel: 'Récompenses',
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreWithDropdown}
        options={{
          tabBarLabel: 'Plus',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileWithDropdown}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
  },
});

export default SimpleMobileTabNavigator;