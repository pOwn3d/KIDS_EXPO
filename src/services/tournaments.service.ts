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
      console.log('🏆 Fetching tournaments...');
      
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.itemsPerPage) params.append('itemsPerPage', filters.itemsPerPage.toString());
      
      const url = params.toString() 
        ? `${API_ENDPOINTS.TOURNAMENTS.LIST}?${params.toString()}`
        : API_ENDPOINTS.TOURNAMENTS.LIST;

      const response = await apiClient.get<TournamentsCollectionResponse>(url);
      
      console.log('✅ Tournaments loaded:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching tournaments:', error);
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
      console.log(`🏆 Fetching tournament ${tournamentId}...`);
      
      const response = await apiClient.get<Tournament>(
        API_ENDPOINTS.TOURNAMENTS.GET(tournamentId)
      );
      
      console.log('✅ Tournament loaded:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Join a tournament
   */
  async joinTournament(tournamentId: number, childId: number): Promise<void> {
    try {
      console.log(`🏆 Joining tournament ${tournamentId}...`);
      
      await apiClient.post(
        API_ENDPOINTS.TOURNAMENTS.JOIN(tournamentId),
        { child: `/api/children/${childId}` }
      );
      
      console.log('✅ Tournament joined successfully');
    } catch (error) {
      console.error(`❌ Error joining tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Get tournament leaderboard
   */
  async getTournamentLeaderboard(tournamentId: number): Promise<TournamentLeaderboard> {
    try {
      console.log(`🏆 Fetching tournament ${tournamentId} leaderboard...`);
      
      const response = await apiClient.get<TournamentLeaderboard>(
        API_ENDPOINTS.TOURNAMENTS.LEADERBOARD(tournamentId)
      );
      
      console.log('✅ Tournament leaderboard loaded:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching tournament leaderboard:`, error);
      throw error;
    }
  }

  /**
   * Create a tournament (parent only)
   */
  async createTournament(tournamentData: Partial<Tournament>): Promise<Tournament> {
    try {
      console.log('🏆 Creating tournament...');
      
      const response = await apiClient.post<Tournament>(
        API_ENDPOINTS.TOURNAMENTS.CREATE,
        tournamentData
      );
      
      console.log('✅ Tournament created:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating tournament:', error);
      throw error;
    }
  }
}

export const tournamentsService = new TournamentsService();