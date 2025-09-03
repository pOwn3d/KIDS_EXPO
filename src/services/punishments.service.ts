import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api/client';
import { API_ENDPOINTS } from '../config/api.config';
import { 
  Punishment,
  AppliedPunishment,
  CreatePunishmentRequest, 
  UpdatePunishmentRequest,
  ApplyPunishmentRequest,
  PunishmentsCollectionResponse,
  AppliedPunishmentsCollectionResponse,
  PunishmentCategory,
  PunishmentDifficulty,
  PUNISHMENT_PRESETS
} from '../types/api/punishments';
import { AgeGroup } from '../types/api/children';

class PunishmentsService {
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
   * Récupérer toutes les punitions disponibles
   */
  async getAllPunishments(filters?: {
    ageGroup?: AgeGroup;
    category?: PunishmentCategory;
    difficulty?: PunishmentDifficulty;
    isActive?: boolean;
  }): Promise<Punishment[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Construire l'URL avec les filtres
      let url = API_ENDPOINTS.PUNISHMENTS.LIST;
      const params = new URLSearchParams();
      
      if (filters?.ageGroup) {
        params.append('ageGroup', filters.ageGroup);
      }
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.difficulty) {
        params.append('difficulty', filters.difficulty);
      }
      if (filters?.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get<PunishmentsCollectionResponse>(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/ld+json',
        },
      });

      // Handle both direct array and hydra format
      let punishmentsArray: any[] = [];
      
      if (Array.isArray(response)) {
        // Direct array format
        punishmentsArray = response;
      } else if (response['hydra:member']) {
        // Hydra format
        punishmentsArray = response['hydra:member'];
      } else if (response['member']) {
        // API Platform format
        punishmentsArray = response['member'];
      } else {
        // Si la réponse a une structure d'objet avec des données, essayer de les récupérer
        if (response && typeof response === 'object') {
          if (response.member) {
            punishmentsArray = response.member;
          }
        }
      }
      
      return punishmentsArray.map((punishment: any) => ({
        ...punishment,
        // Map API Platform fields to our model
        id: punishment.id,
        name: punishment.name || 'Punition',
        description: punishment.description || '',
        points: punishment.pointsToRemove || punishment.pointsDeducted || punishment.points || 0,
        pointsDeducted: punishment.pointsToRemove || punishment.pointsDeducted || punishment.points || 0,
        pointsToRemove: punishment.pointsToRemove || punishment.pointsDeducted || punishment.points || 0,
        severity: punishment.severity || 'minor',
        category: punishment.category || 'general',
        difficulty: punishment.difficulty || 'easy',
        ageGroup: punishment.ageGroup,
        duration: punishment.duration,
        icon: punishment.icon || '⚠️',
        isActive: punishment.isActive !== false,
        createdAt: punishment.createdAt,
        updatedAt: punishment.updatedAt,
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch punishments');
    }
  }

  /**
   * Récupérer une punition par ID
   */
  async getPunishmentById(punishmentId: number): Promise<Punishment | null> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get<Punishment>(API_ENDPOINTS.PUNISHMENTS.GET(punishmentId), {}, {
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
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch punishment');
    }
  }

  /**
   * Créer une nouvelle punition
   */
  async createPunishment(punishmentData: CreatePunishmentRequest): Promise<Punishment> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.post<Punishment>(
        API_ENDPOINTS.PUNISHMENTS.CREATE,
        punishmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
          },
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create punishment');
    }
  }

  /**
   * Mettre à jour une punition
   */
  async updatePunishment(punishmentId: number, updates: UpdatePunishmentRequest): Promise<Punishment> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.put<Punishment>(
        API_ENDPOINTS.PUNISHMENTS.UPDATE(punishmentId),
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
      throw new Error(error.response?.data?.message || error.message || 'Failed to update punishment');
    }
  }

  /**
   * Supprimer une punition
   */
  async deletePunishment(punishmentId: number): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      await apiClient.delete(API_ENDPOINTS.PUNISHMENTS.DELETE(punishmentId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete punishment');
    }
  }

  /**
   * Appliquer une punition à un enfant
   */
  async applyPunishment(punishmentId: number, childId: number, reason?: string, duration?: number): Promise<AppliedPunishment> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }


      const applyData: ApplyPunishmentRequest = {
        punishment: `/api/punishments/${punishmentId}`, // IRI reference
        child: `/api/children/${childId}`, // IRI reference
        reason,
        duration
      };

      const response = await apiClient.post<AppliedPunishment>(
        API_ENDPOINTS.PUNISHMENTS.APPLY(punishmentId),
        applyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
          },
        }
      );


      return response;
    } catch (error: any) {
      
      throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to apply punishment');
    }
  }

  /**
   * Récupérer les punitions actives d'un enfant
   */
  async getActivePunishments(childId: number): Promise<AppliedPunishment[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get<AppliedPunishmentsCollectionResponse>(
        API_ENDPOINTS.PUNISHMENTS.ACTIVE(childId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/ld+json',
          },
        }
      );


      // API Platform retourne toujours 'hydra:member'
      const appliedPunishmentsArray = response['hydra:member'] || [];
      
      return appliedPunishmentsArray.map((appliedPunishment: AppliedPunishment) => ({
        ...appliedPunishment,
        // Assurer la cohérence des propriétés
        id: appliedPunishment.id,
        punishment: appliedPunishment.punishment,
        child: appliedPunishment.child,
        punishmentName: appliedPunishment.punishmentName,
        childName: appliedPunishment.childName,
        reason: appliedPunishment.reason,
        appliedAt: appliedPunishment.appliedAt,
        expiresAt: appliedPunishment.expiresAt,
        isActive: appliedPunishment.isActive !== false,
        appliedBy: appliedPunishment.appliedBy,
      }));
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Récupérer l'historique des punitions d'un enfant
   */
  async getPunishmentHistory(childId: number): Promise<AppliedPunishment[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await apiClient.get<AppliedPunishmentsCollectionResponse>(
        API_ENDPOINTS.PUNISHMENTS.HISTORY(childId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/ld+json',
          },
        }
      );

      // API Platform retourne toujours 'hydra:member'
      const appliedPunishmentsArray = response['hydra:member'] || [];
      
      return appliedPunishmentsArray.map((appliedPunishment: AppliedPunishment) => ({
        ...appliedPunishment,
        id: appliedPunishment.id,
        punishment: appliedPunishment.punishment,
        child: appliedPunishment.child,
        punishmentName: appliedPunishment.punishmentName,
        childName: appliedPunishment.childName,
        reason: appliedPunishment.reason,
        appliedAt: appliedPunishment.appliedAt,
        expiresAt: appliedPunishment.expiresAt,
        isActive: appliedPunishment.isActive !== false,
        appliedBy: appliedPunishment.appliedBy,
      }));
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Récupérer les punitions recommandées par âge - Nouvelle fonctionnalité
   */
  async getPunishmentRecommendationsByAge(ageGroup: AgeGroup): Promise<Punishment[]> {
    try {
      // D'abord essayer de récupérer les punitions depuis l'API
      const punishments = await this.getAllPunishments({ ageGroup, isActive: true });
      
      if (punishments.length > 0) {
        return punishments;
      }

      // Si aucune punition n'est trouvée dans l'API, utiliser les presets
      
      const presets = PUNISHMENT_PRESETS[ageGroup] || [];
      
      // Convertir les presets en objets Punishment (sans ID car ils ne sont pas persistés)
      return presets.map((preset, index) => ({
        '@type': 'Punishment',
        id: index + 1000, // ID temporaire pour les presets
        name: preset.name,
        description: preset.description,
        points: preset.points,
        category: preset.category,
        difficulty: preset.difficulty,
        ageGroup: preset.ageGroup,
        isActive: true
      }));
    } catch (error: any) {
      
      // Fallback vers les presets en cas d'erreur
      const presets = PUNISHMENT_PRESETS[ageGroup] || [];
      return presets.map((preset, index) => ({
        '@type': 'Punishment',
        id: index + 1000,
        name: preset.name,
        description: preset.description,
        points: preset.points,
        category: preset.category,
        difficulty: preset.difficulty,
        ageGroup: preset.ageGroup,
        isActive: true
      }));
    }
  }

  /**
   * Récupérer les recommandations de punitions pour un enfant spécifique
   */
  async getPunishmentRecommendationsForChild(childId: number, ageGroup: AgeGroup): Promise<Punishment[]> {
    try {
      // Récupérer les recommandations par âge
      const recommendations = await this.getPunishmentRecommendationsByAge(ageGroup);
      
      // TODO: Filtrer selon l'historique de l'enfant pour éviter les punitions récentes
      // const history = await this.getPunishmentHistory(childId);
      
      return recommendations;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch child punishment recommendations');
    }
  }

  /**
   * Désactiver une punition appliquée (la terminer avant l'expiration)
   */
  async deactivateAppliedPunishment(appliedPunishmentId: number): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // TODO: Implémenter l'endpoint pour désactiver une punition appliquée
      // Pour l'instant, ce serait probablement un PATCH sur l'AppliedPunishment
      return false;
    } catch (error: any) {
      return false;
    }
  }
}

export const punishmentsService = new PunishmentsService();
export { PUNISHMENT_PRESETS } from '../types/api/punishments';
export type { 
  Punishment, 
  AppliedPunishment, 
  PunishmentCategory, 
  PunishmentDifficulty,
  AgeGroup 
};