import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../types/app/navigation';
import { tournamentsService } from '../../services/tournaments.service';
import type { Tournament } from '../../types/api/tournaments';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

type TournamentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tournaments'>;
type TournamentsScreenRouteProp = RouteProp<RootStackParamList, 'Tournaments'>;

interface Props {
  navigation: TournamentsScreenNavigationProp;
  route: TournamentsScreenRouteProp;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #FFFFFF;
`;

const Header = styled(LinearGradient).attrs({
  colors: ['#3F51B5', '#2196F3'],
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

const TournamentCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 16px;
  margin: 8px 16px;
  overflow: hidden;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 6px;
  elevation: 5;
`;

const TournamentHeader = styled(LinearGradient).attrs(props => ({
  colors: props.status === 'active' ? ['#4CAF50', '#8BC34A'] : 
          props.status === 'pending' ? ['#FF9800', '#FFC107'] : 
          ['#9E9E9E', '#BDBDBD'],
}))`
  padding: 16px;
`;

const TournamentName = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
`;

const TournamentStatus = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatusBadge = styled.View<{ status: string }>`
  background-color: rgba(255, 255, 255, 0.3);
  padding: 4px 8px;
  border-radius: 12px;
  margin-right: 8px;
`;

const StatusText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const TournamentBody = styled.View`
  padding: 16px;
`;

const TournamentDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const TournamentInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const InfoItem = styled.View`
  align-items: center;
`;

const InfoValue = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const InfoLabel = styled.Text`
  font-size: 11px;
  color: #999;
  margin-top: 2px;
`;

const PrizesContainer = styled.View`
  background-color: #F5F5F5;
  border-radius: 8px;
  padding: 12px;
`;

const PrizesTitle = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
`;

const PrizeItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const PrizeRank = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  width: 30px;
`;

const PrizeReward = styled.Text`
  flex: 1;
  font-size: 13px;
  color: #666;
`;

const PrizePoints = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #4CAF50;
`;

const JoinButton = styled.TouchableOpacity`
  background-color: #0EA5E9;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  margin-top: 12px;
`;

const JoinButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 14px;
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

export default function TournamentsScreen({ navigation, route }: Props) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const childId = route.params?.childId;

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const response = await tournamentsService.getTournaments();
      setTournaments(response['hydra:member'] || []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      Alert.alert('Erreur', 'Impossible de charger les tournois');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTournaments();
  };

  const handleJoinTournament = async (tournamentId: number) => {
    if (!childId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un enfant');
      return;
    }
    
    try {
      await tournamentsService.joinTournament(tournamentId, childId);
      Alert.alert('Succès', 'Inscription au tournoi réussie!');
      loadTournaments();
    } catch (error) {
      Alert.alert('Erreur', "Impossible de s'inscrire au tournoi");
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return 'Terminé';
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Demain';
    return `${days} jours`;
  };

  const renderTournament = ({ item }: { item: Tournament }) => (
    <TournamentCard onPress={() => navigation.navigate('TournamentDetails', { tournamentId: item.id })}>
      <TournamentHeader status={item.status}>
        <TournamentName>{item.name}</TournamentName>
        <TournamentStatus>
          <StatusBadge status={item.status}>
            <StatusText>
              {item.status === 'active' ? '🔥 Actif' : 
               item.status === 'pending' ? '⏳ Bientôt' : 
               '✅ Terminé'}
            </StatusText>
          </StatusBadge>
          <StatusText>{getDaysRemaining(item.endDate)}</StatusText>
        </TournamentStatus>
      </TournamentHeader>
      
      <TournamentBody>
        <TournamentDescription>{item.description}</TournamentDescription>
        
        <TournamentInfo>
          <InfoItem>
            <InfoValue>{item.participantCount || 0}</InfoValue>
            <InfoLabel>Participants</InfoLabel>
          </InfoItem>
          <InfoItem>
            <InfoValue>{format(new Date(item.startDate), 'd MMM', { locale: fr })}</InfoValue>
            <InfoLabel>Début</InfoLabel>
          </InfoItem>
          <InfoItem>
            <InfoValue>{format(new Date(item.endDate), 'd MMM', { locale: fr })}</InfoValue>
            <InfoLabel>Fin</InfoLabel>
          </InfoItem>
        </TournamentInfo>
        
        {item.prizes && item.prizes.length > 0 && (
          <PrizesContainer>
            <PrizesTitle>🏆 Récompenses</PrizesTitle>
            {item.prizes.slice(0, 3).map((prize, index) => (
              <PrizeItem key={index}>
                <PrizeRank>{prize.rank}.</PrizeRank>
                <PrizeReward>{prize.reward}</PrizeReward>
                <PrizePoints>{prize.points} pts</PrizePoints>
              </PrizeItem>
            ))}
          </PrizesContainer>
        )}
        
        {item.status === 'active' && (
          <JoinButton onPress={() => handleJoinTournament(item.id)}>
            <JoinButtonText>Participer au tournoi</JoinButtonText>
          </JoinButton>
        )}
      </TournamentBody>
    </TournamentCard>
  );

  if (loading && !refreshing) {
    return (
      <Container>
        <Header>
          <Title>🏅 Tournois</Title>
        </Header>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3F51B5" />
        </View>
      </Container>
    );
  }

  return (
    <WebScreenWrapper
      title="Tournois"
      subtitle="Participez aux tournois et gagnez des récompenses"
      icon="medal"
    >
      <Container>
      
      <FlatList
        data={tournaments}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTournament}
        ListEmptyComponent={
          <EmptyContainer>
            <Ionicons name="medal-outline" size={64} color="#CCC" />
            <EmptyText>Aucun tournoi disponible pour le moment</EmptyText>
          </EmptyContainer>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3F51B5"
          />
        }
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
      />
      
      <FloatingButton>
        <Ionicons name="add" size={28} color="white" />
      </FloatingButton>
      </Container>
    </WebScreenWrapper>
  );
}