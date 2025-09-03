import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api/client';
import { API_ENDPOINTS, API_URL } from '../config/api.config';
import { 
  Reward, 
  RewardClaim,
  CreateRewardRequest, 
  UpdateRewardRequest,
  ClaimRewardRequest,
  RewardsCollectionResponse,
  RewardClaimsCollectionResponse,
  RewardCategory,
  RewardClaimStatus
} from '../types/api/rewards';
import { AgeGroup } from '../types/api/children';

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
  async getAllRewards(filters?: {
    child?: number;
    available?: boolean;
    category?: RewardCategory;
  }): Promise<Reward[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Construire l'URL avec les filtres
      let url = API_ENDPOINTS.REWARDS.LIST;
      const params = new URLSearchParams();
      
      if (filters?.child) {
        params.append('child', filters.child.toString());
      }
      if (filters?.available !== undefined) {
        params.append('available', filters.available.toString());
      }
      if (filters?.category) {
        params.append('category', filters.category);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get<any>(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // Handle the standardized API response format
      let rewardsArray: any[] = [];
      
      if (response && response.success && response.data) {
        // Standardized response format from backend
        rewardsArray = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        // Direct array format (fallback)
        rewardsArray = response;
      } else if (response['hydra:member']) {
        // Hydra format (fallback)
        rewardsArray = response['hydra:member'];
      } else {
        rewardsArray = [];
      }
      
      return rewardsArray.map((reward: any) => ({
        ...reward,
        // Map API Platform fields to our model
        id: reward.id,
        name: reward.name || 'Récompense',
        description: reward.description || '',
        pointsCost: reward.pointsCost || 0,
        category: reward.type || reward.category || 'general',
        type: reward.type || reward.category || 'general',
        available: reward.isActive !== false && reward.available !== false,
        isActive: reward.isActive !== false,
        icon: reward.icon || '🎁',
        maxClaimsPerWeek: reward.maxClaimsPerWeek || 5,
        child: reward.child,
        childName: reward.childName,
        imageUrl: reward.imageUrl,
        ageGroup: reward.ageGroup,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt,
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch rewards');
    }
  }

  /**
   * Récupérer les récompenses disponibles
   */
  async getAvailableRewards(): Promise<Reward[]> {
    return this.getAllRewards({ available: true });
  }

  /**
   * Récupérer les récompenses d'un enfant
   */
  async getChildRewards(childId: number): Promise<Reward[]> {
    return this.getAllRewards({ child: childId });
  }

  /**
   * Récupérer une récompense par ID
   */
  async getRewardById(rewardId: number): Promise<Reward | null> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get<Reward>(API_ENDPOINTS.REWARDS.GET(rewardId), {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/ld+json',
        },
      });

      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reward');
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

      const response = await apiClient.get<RewardClaimsCollectionResponse>(
        API_ENDPOINTS.REWARDS.CLAIMS.LIST,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/ld+json',
          },
        }
      );

      // API Platform retourne toujours 'hydra:member'
      const claimsArray = response['hydra:member'] || [];
      
      return claimsArray.map((claim: RewardClaim) => ({
        ...claim,
        // Assurer la cohérence des propriétés
        id: claim.id,
        reward: claim.reward,
        child: claim.child,
        rewardName: claim.rewardName,
        childName: claim.childName,
        pointsCost: claim.pointsCost || 0,
        status: claim.status || 'pending',
        claimedAt: claim.claimedAt,
        validatedAt: claim.validatedAt,
        rejectedAt: claim.rejectedAt,
        notes: claim.notes,
      }));
    } catch (error: any) {
      
      // En cas d'échec complet, retourner un tableau vide au lieu de faire échouer l'app
      return [];
    }
  }

  /**
   * Réclamer une récompense (enfant)
   */
  async claimReward(rewardId: number, childId: number): Promise<RewardClaim> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }


      const claimData: ClaimRewardRequest = {
        reward: `/api/rewards/${rewardId}`, // IRI reference
        child: `/api/children/${childId}`, // IRI reference
      };

      const response = await apiClient.post<RewardClaim>(
        API_ENDPOINTS.REWARDS.CLAIMS.CREATE,
        claimData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
          },
        }
      );


      return response;
    } catch (error: any) {
      
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to claim reward');
    }
  }

  /**
   * Valider une demande de récompense (parent)
   */
  async validateRewardClaim(claimId: number): Promise<RewardClaim> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.patch<RewardClaim>(
        API_ENDPOINTS.REWARDS.CLAIMS.UPDATE(claimId),
        { status: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json',
          },
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to validate reward claim');
    }
  }

  /**
   * Rejeter une demande de récompense (parent)
   */
  async rejectRewardClaim(claimId: number, reason?: string): Promise<RewardClaim> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.patch<RewardClaim>(
        API_ENDPOINTS.REWARDS.CLAIMS.UPDATE(claimId),
        { 
          status: 'rejected',
          notes: reason
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json',
          },
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to reject reward claim');
    }
  }

  /**
   * Créer une nouvelle récompense
   */
  async createReward(rewardData: CreateRewardRequest): Promise<Reward> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Prepare data with correct field names for backend
      const apiData = {
        name: rewardData.name,
        description: rewardData.description,
        pointsCost: rewardData.pointsCost || rewardData.points_cost,
        type: rewardData.type || 'individual', // Backend only accepts 'individual' or 'collective'
        icon: rewardData.icon || '🎁',
        isActive: rewardData.isActive !== false,
        maxClaimsPerWeek: rewardData.maxClaimsPerWeek || 5,
      };


      const response = await apiClient.post<any>(
        API_ENDPOINTS.REWARDS.CREATE,
        apiData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle standardized response format
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.id) {
        // Direct response format from API Platform (201 Created)
        return response;
      } else if (response) {
        // Fallback: any valid response object
        return response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create reward');
    }
  }

  /**
   * Supprimer une récompense
   */
  async deleteReward(rewardId: number): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      await apiClient.delete(API_ENDPOINTS.REWARDS.DELETE(rewardId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete reward');
    }
  }

  /**
   * Mettre à jour une récompense
   */
  async updateReward(rewardId: number, updates: UpdateRewardRequest): Promise<Reward> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.put<Reward>(
        API_ENDPOINTS.REWARDS.UPDATE(rewardId),
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
          },
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update reward');
    }
  }

  /**
   * Récupérer les recommandations de récompenses par âge - Nouvelle fonctionnalité
   */
  async getRewardRecommendationsByAge(ageGroup: AgeGroup): Promise<Reward[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Mapping des catégories par âge basé sur DATABASE_CONTENT.md
      const categoryMap: Record<AgeGroup, RewardCategory[]> = {
        '3-5': ['entertainment', 'screen_time', 'toy', 'outing', 'food'],
        '6-8': ['screen_time', 'outing', 'money', 'food', 'education', 'social'],
        '9-12': ['screen_time', 'money', 'social', 'subscription', 'gaming', 'privilege'],
        '13-17': ['outing', 'money', 'privilege', 'social', 'subscription', 'shopping']
      };

      const categories = categoryMap[ageGroup] || ['general'];
      const allRewards: Reward[] = [];

      // Récupérer les récompenses pour chaque catégorie
      for (const category of categories) {
        try {
          const rewards = await this.getAllRewards({ category, available: true });
          allRewards.push(...rewards);
        } catch (error) {
        }
      }

      return allRewards;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reward recommendations');
    }
  }

  /**
   * Récupérer les recommandations de récompenses pour un enfant spécifique
   */
  async getRewardRecommendationsForChild(childId: number, ageGroup: AgeGroup): Promise<Reward[]> {
    try {
      // Combiner les recommandations par âge avec les récompenses spécifiques à l'enfant
      const [recommendations, childRewards] = await Promise.all([
        this.getRewardRecommendationsByAge(ageGroup),
        this.getChildRewards(childId)
      ]);

      // Fusionner et éliminer les doublons
      const allRewards = [...recommendations, ...childRewards];
      const uniqueRewards = allRewards.filter((reward, index, self) => 
        index === self.findIndex(r => r.id === reward.id)
      );

      return uniqueRewards.filter(reward => reward.available);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch child reward recommendations');
    }
  }
}

export const rewardsService = new RewardsService();
export type { Reward, RewardClaim };