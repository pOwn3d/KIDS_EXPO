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
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../types/app/navigation';
import { guildsService } from '../../services/guilds.service';
import type { Guild } from '../../types/api/guilds';
import WebScreenWrapper from '../../components/layout/WebScreenWrapper';

type GuildsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Guilds'>;
type GuildsScreenRouteProp = RouteProp<RootStackParamList, 'Guilds'>;

interface Props {
  navigation: GuildsScreenNavigationProp;
  route: GuildsScreenRouteProp;
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #FFFFFF;
`;

const Header = styled(LinearGradient).attrs({
  colors: ['#795548', '#5D4037'],
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

const GuildCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 16px;
  margin: 8px 16px;
  padding: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 6px;
  elevation: 5;
`;

const GuildHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const GuildIcon = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #0EA5E9;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const GuildInfo = styled.View`
  flex: 1;
`;

const GuildName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const GuildLevel = styled.View`
  flex-direction: row;
  align-items: center;
`;

const LevelBadge = styled.View`
  background-color: #FFC107;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 8px;
`;

const LevelText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: white;
`;

const GuildDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const GuildStats = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 12px;
  background-color: #F5F5F5;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const StatLabel = styled.Text`
  font-size: 11px;
  color: #999;
  margin-top: 2px;
`;

const MembersContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const MemberAvatar = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #E0E0E0;
  border: 2px solid white;
  margin-left: -8px;
  justify-content: center;
  align-items: center;
`;

const MemberCount = styled.Text`
  font-size: 12px;
  color: #666;
  margin-left: 8px;
`;

const JoinButton = styled.TouchableOpacity<{ full?: boolean }>`
  background-color: ${props => props.full ? '#9E9E9E' : '#0EA5E9'};
  padding: 12px;
  border-radius: 8px;
  align-items: center;
`;

const JoinButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const ExperienceBar = styled.View`
  height: 6px;
  background-color: #E0E0E0;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
`;

const ExperienceFill = styled.View<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: #4CAF50;
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

export default function GuildsScreen({ navigation, route }: Props) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const childId = route.params?.childId;

  useEffect(() => {
    loadGuilds();
  }, []);

  const loadGuilds = async () => {
    try {
      setLoading(true);
      const response = await guildsService.getGuilds();
      setGuilds(response['hydra:member'] || []);
    } catch (error) {
      console.error('Error loading guilds:', error);
      Alert.alert('Erreur', 'Impossible de charger les guildes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGuilds();
  };

  const handleJoinGuild = async (guildId: number) => {
    if (!childId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un enfant');
      return;
    }
    
    try {
      await guildsService.joinGuild(guildId, childId);
      Alert.alert('Succès', 'Vous avez rejoint la guilde!');
      loadGuilds();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rejoindre la guilde');
    }
  };

  const getExperienceProgress = (guild: Guild): number => {
    const nextLevelExp = (guild.level + 1) * 1000;
    return Math.min((guild.experiencePoints / nextLevelExp) * 100, 100);
  };

  const renderGuild = ({ item }: { item: Guild }) => {
    const isFull = item.memberCount >= item.maxMembers;
    
    return (
      <GuildCard onPress={() => navigation.navigate('GuildDetails', { guildId: item.id })}>
        <GuildHeader>
          <GuildIcon>
            <Ionicons name="shield" size={32} color="white" />
          </GuildIcon>
          <GuildInfo>
            <GuildName>{item.name}</GuildName>
            <GuildLevel>
              <LevelBadge>
                <LevelText>Niv. {item.level}</LevelText>
              </LevelBadge>
              <Text style={{ fontSize: 12, color: '#666' }}>
                {item.experiencePoints} XP
              </Text>
            </GuildLevel>
          </GuildInfo>
        </GuildHeader>
        
        <GuildDescription>{item.description}</GuildDescription>
        
        <GuildStats>
          <StatItem>
            <StatValue>{item.memberCount}</StatValue>
            <StatLabel>Membres</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{item.maxMembers}</StatValue>
            <StatLabel>Max</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{item.level}</StatValue>
            <StatLabel>Niveau</StatLabel>
          </StatItem>
        </GuildStats>
        
        <MembersContainer>
          {[...Array(Math.min(5, item.memberCount))].map((_, index) => (
            <MemberAvatar key={index} style={{ zIndex: 5 - index }}>
              <Text>👤</Text>
            </MemberAvatar>
          ))}
          {item.memberCount > 5 && (
            <MemberCount>+{item.memberCount - 5} autres</MemberCount>
          )}
        </MembersContainer>
        
        <ExperienceBar>
          <ExperienceFill progress={getExperienceProgress(item)} />
        </ExperienceBar>
        
        <View style={{ marginTop: 12 }}>
          <JoinButton full={isFull} onPress={() => handleJoinGuild(item.id)} disabled={isFull}>
            <JoinButtonText>
              {isFull ? 'Guilde complète' : 'Rejoindre la guilde'}
            </JoinButtonText>
          </JoinButton>
        </View>
      </GuildCard>
    );
  };

  if (loading && !refreshing) {
    return (
      <Container>
        <Header>
          <Title>⚔️ Guildes</Title>
        </Header>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#795548" />
        </View>
      </Container>
    );
  }

  return (
    <WebScreenWrapper
      title="Guildes"
      subtitle="Rejoignez une guilde et progressez ensemble"
      icon="people"
    >
      <Container>
      
      <FlatList
        data={guilds}
        keyExtractor={item => item.id.toString()}
        renderItem={renderGuild}
        ListEmptyComponent={
          <EmptyContainer>
            <Ionicons name="people-outline" size={64} color="#CCC" />
            <EmptyText>Aucune guilde disponible pour le moment</EmptyText>
          </EmptyContainer>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#795548"
          />
        }
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
      />
      
      <FloatingButton onPress={() => Alert.alert('Créer une guilde', 'Fonctionnalité à venir')}>
        <Ionicons name="add" size={28} color="white" />
      </FloatingButton>
      </Container>
    </WebScreenWrapper>
  );
}