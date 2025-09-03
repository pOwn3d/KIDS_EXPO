import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../types/app/navigation';

type MoreScreenNavigationProp = StackNavigationProp<RootStackParamList, 'More'>;
type MoreScreenRouteProp = RouteProp<RootStackParamList, 'More'>;

interface Props {
  navigation: MoreScreenNavigationProp;
  route: MoreScreenRouteProp;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #FFFFFF;
`;

const Header = styled(LinearGradient).attrs({
  colors: ['#007AFF', '#0051D5'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  padding: 20px;
  padding-top: 40px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: white;
  text-align: center;
`;

const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 16px 8px;
`;

const MenuCard = styled.TouchableOpacity`
  width: 31.33%;
  aspect-ratio: 1;
  margin: 1%;
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const MenuIcon = styled.View<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${props => props.color}20;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const MenuTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-align: center;
`;

const MenuBadge = styled.View`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #FF3B30;
  padding: 2px 6px;
  border-radius: 10px;
`;

const BadgeText = styled.Text`
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  badge?: number;
  onPress: () => void;
}

export default function MoreScreen({ navigation, route }: Props) {
  const childId = route.params?.childId;
  
  // TODO: Get user role from Redux when available
  const userRole = 'PARENT'; // Default to parent for now

  const menuItems: MenuItem[] = [
    ...(userRole === 'PARENT' ? [{
      id: 'children',
      title: 'Enfants',
      icon: 'people',
      color: '#2196F3',
      onPress: () => navigation.navigate('Children' as any),
    }] : []),
    {
      id: 'activities',
      title: 'Activités',
      icon: 'analytics',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Activities', { childId }),
    },
    {
      id: 'badges',
      title: 'Badges',
      icon: 'trophy',
      color: '#9C27B0',
      onPress: () => navigation.navigate('Badges', { childId }),
    },
    {
      id: 'tournaments',
      title: 'Tournois',
      icon: 'medal',
      color: '#3F51B5',
      badge: 2, // Active tournaments
      onPress: () => navigation.navigate('Tournaments', { childId }),
    },
    {
      id: 'guilds',
      title: 'Guildes',
      icon: 'shield',
      color: '#795548',
      onPress: () => navigation.navigate('Guilds', { childId }),
    },
    {
      id: 'leaderboard',
      title: 'Classement',
      icon: 'podium',
      color: '#FF9800',
      onPress: () => navigation.navigate('Leaderboard'),
    },
    ...(userRole === 'PARENT' ? [{
      id: 'punishments',
      title: 'Punitions',
      icon: 'warning',
      color: '#F44336',
      onPress: () => navigation.navigate('Punishments' as any, { childId }),
    }] : []),
    {
      id: 'statistics',
      title: 'Statistiques',
      icon: 'stats-chart',
      color: '#00BCD4',
      onPress: () => navigation.navigate('Statistics', { childId }),
    },
    {
      id: 'profile',
      title: 'Profil',
      icon: 'person',
      color: '#607D8B',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: 'settings',
      color: '#9E9E9E',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <Container>
      <Header>
        <Title>Plus</Title>
      </Header>
      
      <ScrollView>
        <Grid>
          {menuItems.map(item => (
            <MenuCard key={item.id} onPress={item.onPress}>
              {item.badge && (
                <MenuBadge>
                  <BadgeText>{item.badge}</BadgeText>
                </MenuBadge>
              )}
              <MenuIcon color={item.color}>
                <Ionicons 
                  name={item.icon as any} 
                  size={28} 
                  color={item.color} 
                />
              </MenuIcon>
              <MenuTitle>{item.title}</MenuTitle>
            </MenuCard>
          ))}
        </Grid>
      </ScrollView>
    </Container>
  );
}