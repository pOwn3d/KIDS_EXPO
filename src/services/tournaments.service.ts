/**
 * Tournaments Service
 * Handles all tournament-related API calls
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from '../config/api.config';
import type { 
  Tournament, 
  TournamentsCollectionResponse, 
  TournamentFilters,
  TournamentLeaderboard 
} from '../types/api/tournaments';

class TournamentsService {
  /**
   * Get list of tournaments
   */
  async getTournaments(filters?: TournamentFilters): Promise<TournamentsCollectionResponse> {
    try {
      
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.itemsPerPage) params.append('itemsPerPage', filters.itemsPerPage.toString());
      
      const url = params.toString() 
        ? `${API_ENDPOINTS.TOURNAMENTS.LIST}?${params.toString()}`
        : API_ENDPOINTS.TOURNAMENTS.LIST;

      const response = await apiClient.get<TournamentsCollectionResponse>(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active tournaments
   */
  async getActiveTournaments(): Promise<TournamentsCollectionResponse> {
    return this.getTournaments({ status: 'active' });
  }

  /**
   * Get tournament details
   */
  async getTournament(tournamentId: number): Promise<Tournament> {
    try {
      
      const response = await apiClient.get<Tournament>(
        API_ENDPOINTS.TOURNAMENTS.GET(tournamentId)
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Join a tournament
   */
  async joinTournament(tournamentId: number, childId: number): Promise<void> {
    try {
      
      await apiClient.post(
        API_ENDPOINTS.TOURNAMENTS.JOIN(tournamentId),
        { child: `/api/children/${childId}` }
      );
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get tournament leaderboard
   */
  async getTournamentLeaderboard(tournamentId: number): Promise<TournamentLeaderboard> {
    try {
      
      const response = await apiClient.get<TournamentLeaderboard>(
        API_ENDPOINTS.TOURNAMENTS.LEADERBOARD(tournamentId)
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a tournament (parent only)
   */
  async createTournament(tournamentData: Partial<Tournament>): Promise<Tournament> {
    try {
      
      const response = await apiClient.post<Tournament>(
        API_ENDPOINTS.TOURNAMENTS.CREATE,
        tournamentData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const tournamentsService = new TournamentsService();