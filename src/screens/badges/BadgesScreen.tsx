import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../types/app/navigation';
import { badgesService } from '../../services/badges.service';
import type { Badge, ChildBadge } from '../../types/api/badges';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

type BadgesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Badges'>;
type BadgesScreenRouteProp = RouteProp<RootStackParamList, 'Badges'>;

interface Props {
  navigation: BadgesScreenNavigationProp;
  route: BadgesScreenRouteProp;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #FFFFFF;
`;

const Header = styled(LinearGradient).attrs({
  colors: ['#9C27B0', '#673AB7'],
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

const Subtitle = styled.Text`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-top: 4px;
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: white;
  padding: 8px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 2;
`;

const Tab = styled.TouchableOpacity<{ active?: boolean }>`
  flex: 1;
  padding: 12px;
  background-color: ${props => props.active ? '#0EA5E9' : 'transparent'};
  border-radius: 8px;
  margin: 0 4px;
`;

const TabText = styled.Text<{ active?: boolean }>`
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  text-align: center;
`;

const BadgeGrid = styled.View`
  padding: 16px;
`;

const BadgeCard = styled.TouchableOpacity<{ earned?: boolean }>`
  width: 31%;
  aspect-ratio: 1;
  background-color: ${props => props.earned ? 'white' : '#F5F5F5'};
  border-radius: 16px;
  padding: 12px;
  margin: 1%;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: ${props => props.earned ? 0.15 : 0.05};
  shadow-radius: 4px;
  elevation: ${props => props.earned ? 5 : 2};
  align-items: center;
  justify-content: center;
  opacity: ${props => props.earned ? 1 : 0.6};
`;

const BadgeIcon = styled.Text`
  font-size: 42px;
  margin-bottom: 8px;
`;

const BadgeName = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #333;
  text-align: center;
`;

const BadgePoints = styled.Text`
  font-size: 10px;
  color: #666;
  margin-top: 4px;
`;

const ProgressBar = styled.View`
  width: 100%;
  height: 4px;
  background-color: #E0E0E0;
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.View<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: #4CAF50;
`;

const StatsContainer = styled.View`
  flex-direction: row;
  padding: 20px;
  background-color: white;
  margin: 16px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const StatItem = styled.View`
  flex: 1;
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #0EA5E9;
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const FloatingButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: #0EA5E9;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 6px;
  elevation: 8;
`;

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  width: 90%;
  max-width: 400px;
  background-color: white;
  border-radius: 20px;
  padding: 24px;
`;

const ModalHeader = styled.View`
  align-items: center;
  margin-bottom: 16px;
`;

const ModalBadgeIcon = styled.Text`
  font-size: 64px;
  margin-bottom: 12px;
`;

const ModalTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const ModalDescription = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 8px;
`;

const ModalCriteria = styled.View`
  background-color: #F5F5F5;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
`;

const CriteriaText = styled.Text`
  font-size: 14px;
  color: #333;
  text-align: center;
`;

const ModalButton = styled.TouchableOpacity`
  background-color: #0EA5E9;
  padding: 14px;
  border-radius: 8px;
  align-items: center;
`;

const ModalButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 16px;
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

export default function BadgesScreen({ navigation, route }: Props) {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [childBadges, setChildBadges] = useState<ChildBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'earned' | 'progress'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const childId = route.params?.childId;

  useEffect(() => {
    loadBadges();
  }, [childId]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      
      // Load all badges
      const badgesResponse = await badgesService.getBadges();
      setAllBadges(badgesResponse['hydra:member'] || []);
      
      // Load child badges if childId is provided
      if (childId) {
        const childBadgesData = await badgesService.getChildBadges(childId);
        setChildBadges(childBadgesData);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
      Alert.alert('Erreur', 'Impossible de charger les badges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBadges();
  };

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  const isEarned = (badgeId: number): boolean => {
    return childBadges.some(cb => cb.badgeId === badgeId && cb.earned);
  };

  const getProgress = (badgeId: number): number => {
    const childBadge = childBadges.find(cb => cb.badgeId === badgeId);
    return childBadge?.progress || 0;
  };

  const getFilteredBadges = () => {
    switch (selectedTab) {
      case 'earned':
        return allBadges.filter(badge => isEarned(badge.id));
      case 'progress':
        return allBadges.filter(badge => !isEarned(badge.id) && getProgress(badge.id) > 0);
      default:
        return allBadges;
    }
  };

  const earnedCount = childBadges.filter(cb => cb.earned).length;
  const totalPoints = childBadges.reduce((sum, cb) => sum + (cb.earned ? cb.points || 0 : 0), 0);

  const renderBadge = (badge: Badge) => {
    const earned = isEarned(badge.id);
    const progress = getProgress(badge.id);
    
    return (
      <BadgeCard
        key={badge.id}
        earned={earned}
        onPress={() => handleBadgePress(badge)}
      >
        <BadgeIcon>{badge.icon || '🏆'}</BadgeIcon>
        <BadgeName>{badge.name}</BadgeName>
        <BadgePoints>{badge.points} pts</BadgePoints>
        {!earned && progress > 0 && (
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
        )}
      </BadgeCard>
    );
  };

  if (loading && !refreshing) {
    return (
      <Container>
        <Header>
          <Title>🏆 Badges</Title>
        </Header>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#9C27B0" />
        </View>
      </Container>
    );
  }

  const filteredBadges = getFilteredBadges();

  return (
    <WebScreenWrapper
      title="Badges"
      subtitle="Collection de badges et récompenses"
      icon="ribbon"
    >
      <Container>
      
      <TabContainer>
        <Tab 
          active={selectedTab === 'all'}
          onPress={() => setSelectedTab('all')}
        >
          <TabText active={selectedTab === 'all'}>Tous</TabText>
        </Tab>
        <Tab 
          active={selectedTab === 'earned'}
          onPress={() => setSelectedTab('earned')}
        >
          <TabText active={selectedTab === 'earned'}>Obtenus</TabText>
        </Tab>
        <Tab 
          active={selectedTab === 'progress'}
          onPress={() => setSelectedTab('progress')}
        >
          <TabText active={selectedTab === 'progress'}>En cours</TabText>
        </Tab>
      </TabContainer>
      
      <StatsContainer>
        <StatItem>
          <StatValue>{earnedCount}</StatValue>
          <StatLabel>Badges obtenus</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{allBadges.length - earnedCount}</StatValue>
          <StatLabel>À débloquer</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{totalPoints}</StatValue>
          <StatLabel>Points gagnés</StatLabel>
        </StatItem>
      </StatsContainer>
      
      <FlatList
        data={filteredBadges}
        numColumns={3}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => renderBadge(item)}
        ListEmptyComponent={
          <EmptyContainer>
            <Ionicons name="trophy-outline" size={64} color="#CCC" />
            <EmptyText>
              {selectedTab === 'earned'
                ? "Aucun badge obtenu pour le moment"
                : selectedTab === 'progress'
                ? "Aucun badge en cours"
                : "Aucun badge disponible"
              }
            </EmptyText>
          </EmptyContainer>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#9C27B0"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      />
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalContainer>
          <ModalContent>
            <TouchableOpacity 
              style={{ position: 'absolute', top: 16, right: 16 }}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <ModalHeader>
              <ModalBadgeIcon>{selectedBadge?.icon || '🏆'}</ModalBadgeIcon>
              <ModalTitle>{selectedBadge?.name}</ModalTitle>
              <ModalDescription>{selectedBadge?.description}</ModalDescription>
            </ModalHeader>
            
            <ModalCriteria>
              <CriteriaText>{selectedBadge?.criteria}</CriteriaText>
            </ModalCriteria>
            
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#9C27B0' }}>
                {selectedBadge?.points} points
              </Text>
            </View>
            
            <ModalButton onPress={() => setModalVisible(false)}>
              <ModalButtonText>Fermer</ModalButtonText>
            </ModalButton>
          </ModalContent>
        </ModalContainer>
      </Modal>
      </Container>
    </WebScreenWrapper>
  );
}