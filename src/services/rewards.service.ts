import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api.interceptor';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  status: string;
  category: string;
  imageUrl?: string;
  icon?: string;
  availability: 'available' | 'claimed' | 'pending' | 'out_of_stock';
  expiryDate?: string;
  createdAt?: string;
}

interface RewardClaim {
  id: string;
  rewardId: string;
  childId: string;
  childName: string;
  rewardName: string;
  pointsCost: number;
  status: 'pending' | 'approved' | 'rejected';
  claimedAt: string;
  validatedAt?: string;
}

class RewardsService {
  /**
   * Récupérer le token d'authentification
   */
  private async getToken(): Promise<string | null> {
    // Essayer les deux clés possibles
    let token = await AsyncStorage.getItem('access_token');
    if (!token) {
      token = await AsyncStorage.getItem('auth_token');
    }
    return token;
  }

  /**
   * Récupérer toutes les récompenses
   */
  async getAllRewards(): Promise<Reward[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get(
        `${API_URL}/api/rewards`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Rewards API response:', response.data);
      
      // Gérer différentes structures de réponse possibles
      let rewardsArray = [];
      
      if (response.data.success && response.data.data?.rewards) {
        rewardsArray = response.data.data.rewards;
      } else if (Array.isArray(response.data)) {
        // Filtrer les éléments vides et les tableaux vides
        rewardsArray = response.data.filter(reward => 
          reward && 
          typeof reward === 'object' && 
          !Array.isArray(reward) &&
          Object.keys(reward).length > 0
        );
      } else if (response.data['hydra:member']) {
        rewardsArray = response.data['hydra:member'];
      } else if (response.data.data && Array.isArray(response.data.data)) {
        rewardsArray = response.data.data;
      } else if (response.data.rewards) {
        rewardsArray = response.data.rewards;
      }
      
      console.log('Rewards extracted:', rewardsArray);
      
      // Transformer les données depuis le format API
      return rewardsArray.map((reward: any) => {
        console.log('Reward data:', reward);
        
        const rewardId = reward.id;
        const rewardName = reward.name || reward.title || `Récompense #${rewardId || 'Unknown'}`;
        
        // Déterminer le statut de disponibilité
        let availability: 'available' | 'claimed' | 'pending' | 'out_of_stock' = 'available';
        if (reward.is_claimed === true) {
          availability = 'claimed';
        } else if (reward.is_available === false) {
          availability = 'out_of_stock';
        } else if (reward.status === 'pending') {
          availability = 'pending';
        }
        
        return {
          id: rewardId ? String(rewardId) : Math.random().toString(),
          name: rewardName,
          description: reward.description || '',
          pointsCost: reward.pointsCost || reward.cost || reward.points || 0,
          status: reward.status || 'active',
          category: reward.category || 'general',
          imageUrl: reward.imageUrl || reward.image,
          icon: reward.icon,
          availability: availability,
          expiryDate: reward.expiry_date || reward.expiryDate,
          createdAt: reward.created_at || reward.createdAt,
        };
      });
    } catch (error: any) {
      console.error('Failed to fetch rewards:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch rewards');
    }
  }

  /**
   * Récupérer les récompenses disponibles
   */
  async getAvailableRewards(): Promise<Reward[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get(
        `${API_URL}/api/rewards/available`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rewards = response.data.data || response.data || [];
      
      return rewards.map((reward: any) => ({
        id: reward.id ? String(reward.id) : Math.random().toString(),
        name: reward.name || reward.title,
        description: reward.description || '',
        pointsCost: reward.pointsCost || reward.cost || reward.points || 0,
        status: reward.status || 'active',
        category: reward.category || 'general',
        imageUrl: reward.imageUrl || reward.image,
        icon: reward.icon,
        availability: 'available' as const,
        expiryDate: reward.expiry_date || reward.expiryDate,
        createdAt: reward.created_at || reward.createdAt,
      }));
    } catch (error: any) {
      console.error('Failed to fetch available rewards:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch available rewards');
    }
  }

  /**
   * Récupérer les récompenses d'un enfant
   */
  async getChildRewards(childId: string): Promise<Reward[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get(
        `${API_URL}/api/rewards/child/${childId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rewards = response.data.data || response.data || [];
      
      return rewards.map((reward: any) => ({
        id: reward.id ? String(reward.id) : Math.random().toString(),
        name: reward.name || reward.title,
        description: reward.description || '',
        pointsCost: reward.pointsCost || reward.cost || reward.points || 0,
        status: reward.status || 'active',
        category: reward.category || 'general',
        imageUrl: reward.imageUrl || reward.image,
        icon: reward.icon,
        availability: reward.availability || 'available',
        expiryDate: reward.expiry_date || reward.expiryDate,
        createdAt: reward.created_at || reward.createdAt,
      }));
    } catch (error: any) {
      console.error('Failed to fetch child rewards:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch child rewards');
    }
  }

  /**
   * Récupérer les demandes de récompenses en attente
   */
  async getRewardClaims(): Promise<RewardClaim[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get(
        `${API_URL}/api/rewards/claims`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const claims = response.data.data || response.data || [];
      
      return claims.map((claim: any) => ({
        id: claim.id ? String(claim.id) : Math.random().toString(),
        rewardId: claim.reward_id || claim.rewardId,
        childId: claim.child_id || claim.childId,
        childName: claim.child_name || claim.childName || 'Enfant',
        rewardName: claim.reward_name || claim.rewardName || 'Récompense',
        pointsCost: claim.points_cost || claim.pointsCost || 0,
        status: claim.status || 'pending',
        claimedAt: claim.claimed_at || claim.claimedAt,
        validatedAt: claim.validated_at || claim.validatedAt,
      }));
    } catch (error: any) {
      console.error('Failed to fetch reward claims:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reward claims');
    }
  }

  /**
   * Réclamer une récompense (enfant)
   */
  async claimReward(rewardId: string, childId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🎁 Claiming reward:', {
        rewardId,
        childId,
        url: `${API_URL}/api/rewards/${rewardId}/claim`,
        payload: { childId }
      });

      const response = await apiClient.post(
        `${API_URL}/api/rewards/${rewardId}/claim`,
        { childId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('🎁 Claim response:', {
        status: response.status,
        data: response.data,
        success: response.data.success
      });

      return response.data.success || response.status === 200 || response.status === 201;
    } catch (error: any) {
      console.error('🚨 Claim reward error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        payload: error.config?.data
      });
      
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to claim reward');
    }
  }

  /**
   * Valider une demande de récompense (parent)
   */
  async validateRewardClaim(claimId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.post(
        `${API_URL}/api/rewards/claims/${claimId}/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.success || response.status === 200;
    } catch (error: any) {
      console.error('Failed to validate reward claim:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to validate reward claim');
    }
  }

  /**
   * Rejeter une demande de récompense (parent)
   */
  async rejectRewardClaim(claimId: string, reason?: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.post(
        `${API_URL}/api/rewards/claims/${claimId}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.success || response.status === 200;
    } catch (error: any) {
      console.error('Failed to reject reward claim:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reject reward claim');
    }
  }

  /**
   * Créer une nouvelle récompense
   */
  async createReward(rewardData: {
    name: string;
    description: string;
    pointsCost: number;
    category: string;
    imageUrl?: string;
    icon?: string;
    expiryDate?: string;
  }): Promise<Reward> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.post(
        `${API_URL}/api/rewards`,
        {
          name: rewardData.name,
          description: rewardData.description,
          pointsCost: rewardData.pointsCost,
          category: rewardData.category,
          imageUrl: rewardData.imageUrl,
          icon: rewardData.icon || '🎁',
          expiryDate: rewardData.expiryDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Failed to create reward:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create reward');
    }
  }

  /**
   * Supprimer une récompense
   */
  async deleteReward(rewardId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.delete(
        `${API_URL}/api/rewards/${rewardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.status === 204 || response.status === 200;
    } catch (error: any) {
      console.error('Failed to delete reward:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete reward');
    }
  }

  /**
   * Mettre à jour une récompense
   */
  async updateReward(rewardId: string, updates: Partial<Reward>): Promise<Reward> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.put(
        `${API_URL}/api/rewards/${rewardId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Failed to update reward:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update reward');
    }
  }
}

export const rewardsService = new RewardsService();
export type { Reward, RewardClaim };