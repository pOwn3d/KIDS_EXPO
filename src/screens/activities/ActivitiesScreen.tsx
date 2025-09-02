import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RootStackParamList } from '../../types/app/navigation';
import { activitiesService } from '../../services/activities.service';
import type { Activity, ActivityType } from '../../types/api/activities';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

type ActivitiesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Activities'>;
type ActivitiesScreenRouteProp = RouteProp<RootStackParamList, 'Activities'>;

interface Props {
  navigation: ActivitiesScreenNavigationProp;
  route: ActivitiesScreenRouteProp;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #FFFFFF;
`;

const Header = styled.View`
  padding: 20px;
  background-color: #0EA5E9;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-align: center;
`;

const FilterContainer = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  padding: 10px;
  background-color: white;
  max-height: 60px;
`;

const FilterChip = styled.TouchableOpacity<{ active?: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.active ? '#0EA5E9' : '#F0F0F0'};
  border-radius: 20px;
  margin-right: 8px;
  height: 36px;
  justify-content: center;
  align-items: center;
`;

const FilterText = styled.Text<{ active?: boolean }>`
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  font-size: 14px;
`;

const SearchContainer = styled.View`
  padding: 0 16px 10px;
`;

const SearchBar = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 10px;
  padding: 10px 15px;
  gap: 10px;
`;

const SearchInput = styled(TextInput)`
  flex: 1;
  font-size: 16px;
  color: #333;
`;

const ActivityCard = styled.View`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin: 8px 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
  flex-direction: row;
  align-items: center;
`;

const ActivityIcon = styled.View<{ type: ActivityType }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${props => getActivityColor(props.type)};
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const ActivityInfo = styled.View`
  flex: 1;
`;

const ActivityTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ActivityDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const ActivityTime = styled.Text`
  font-size: 12px;
  color: #999;
`;

const ActivityPoints = styled.View`
  align-items: center;
`;

const PointsText = styled.Text<{ positive?: boolean }>`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.positive ? '#4CAF50' : '#F44336'};
`;

const PointsLabel = styled.Text`
  font-size: 11px;
  color: #999;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #999;
  text-align: center;
  margin-top: 16px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

function getActivityColor(type: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    mission_completed: '#4CAF50',
    mission_validated: '#8BC34A',
    reward_claimed: '#FF9800',
    reward_approved: '#FFC107',
    badge_earned: '#9C27B0',
    points_earned: '#2196F3',
    points_deducted: '#F44336',
    level_up: '#00BCD4',
    punishment_applied: '#FF5722',
    tournament_joined: '#3F51B5',
    guild_joined: '#795548',
  };
  return colors[type] || '#9E9E9E';
}

function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    mission_completed: 'checkmark-circle',
    mission_validated: 'checkmark-done',
    reward_claimed: 'gift',
    reward_approved: 'gift-outline',
    badge_earned: 'trophy',
    points_earned: 'trending-up',
    points_deducted: 'trending-down',
    level_up: 'arrow-up-circle',
    punishment_applied: 'warning',
    tournament_joined: 'medal',
    guild_joined: 'people',
  };
  return icons[type] || 'information-circle';
}

const ACTIVITY_FILTERS: { label: string; value: ActivityType | 'all' }[] = [
  { label: 'Tout', value: 'all' },
  { label: 'Missions', value: 'mission_completed' },
  { label: 'Récompenses', value: 'reward_claimed' },
  { label: 'Badges', value: 'badge_earned' },
  { label: 'Points', value: 'points_earned' },
  { label: 'Niveaux', value: 'level_up' },
  { label: 'Tournois', value: 'tournament_joined' },
  { label: 'Guildes', value: 'guild_joined' },
];

export default function ActivitiesScreen({ navigation, route }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const childId = route.params?.childId;

  useEffect(() => {
    loadActivities();
  }, [childId, selectedFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      const filters = {
        ...(childId && { child: childId }),
        ...(selectedFilter !== 'all' && { type: selectedFilter }),
      };
      
      const response = await activitiesService.getActivities(filters);
      
      // Handle different API response formats
      // The backend returns activities as a direct array
      const activitiesData = Array.isArray(response) 
        ? response 
        : (response?.['hydra:member'] || response?.member || response?.data || []);
      
      console.log('Activities loaded:', activitiesData.length, 'items');
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
      // Set empty array on error
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const getFilteredActivities = () => {
    let filtered = activities;
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        (activity.title && activity.title.toLowerCase().includes(query)) ||
        (activity.description && activity.description.toLowerCase().includes(query)) ||
        (activity.childName && activity.childName.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <ActivityCard>
      <ActivityIcon type={item.type}>
        <Ionicons 
          name={getActivityIcon(item.type) as any} 
          size={24} 
          color="white" 
        />
      </ActivityIcon>
      
      <ActivityInfo>
        <ActivityTitle>{item.title || item.description}</ActivityTitle>
        {item.description && item.title && (
          <ActivityDescription>{item.description}</ActivityDescription>
        )}
        {item.childName && (
          <ActivityDescription>Par {item.childName}</ActivityDescription>
        )}
        <ActivityTime>
          {format(new Date(item.createdAt), "d MMMM 'à' HH:mm", { locale: fr })}
        </ActivityTime>
      </ActivityInfo>
      
      {item.points && (
        <ActivityPoints>
          <PointsText positive={item.points > 0}>
            {item.points > 0 ? '+' : ''}{item.points}
          </PointsText>
          <PointsLabel>points</PointsLabel>
        </ActivityPoints>
      )}
    </ActivityCard>
  );

  const renderEmpty = () => (
    <EmptyContainer>
      <Ionicons name="calendar-outline" size={64} color="#CCC" />
      <EmptyText>
        {selectedFilter === 'all' 
          ? "Aucune activité pour le moment"
          : `Aucune activité de type "${ACTIVITY_FILTERS.find(f => f.value === selectedFilter)?.label}"`
        }
      </EmptyText>
    </EmptyContainer>
  );

  if (loading && !refreshing) {
    return (
      <Container>
        <Header>
          <Title>📊 Activités</Title>
        </Header>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#007AFF" />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <WebScreenWrapper
      title="Activités"
      subtitle="Suivez l'historique des activités"
      icon="analytics"
    >
      <Container>
      
      {/* Search Bar */}
      <SearchContainer>
        <SearchBar>
          <Ionicons name="search" size={20} color="#999" />
          <SearchInput
            placeholder="Rechercher une activité..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </SearchBar>
      </SearchContainer>
      
      <FilterContainer>
        {ACTIVITY_FILTERS.map(filter => (
          <FilterChip
            key={filter.value}
            active={selectedFilter === filter.value}
            onPress={() => setSelectedFilter(filter.value as ActivityType | 'all')}
          >
            <FilterText active={selectedFilter === filter.value}>
              {filter.label}
            </FilterText>
          </FilterChip>
        ))}
      </FilterContainer>
      
      <FlatList
        data={getFilteredActivities()}
        keyExtractor={item => item.id.toString()}
        renderItem={renderActivity}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
      </Container>
    </WebScreenWrapper>
  );
}