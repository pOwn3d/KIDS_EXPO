/**
 * Guilds Service
 * Handles all guild-related API calls
 */

import { apiClient } from './api/client';
import { API_ENDPOINTS } from '../config/api.config';
import type { 
  Guild, 
  GuildsCollectionResponse,
  GuildMember,
  GuildInvitation 
} from '../types/api/guilds';

class GuildsService {
  /**
   * Get list of guilds
   */
  async getGuilds(): Promise<GuildsCollectionResponse> {
    try {
      
      const response = await apiClient.get<GuildsCollectionResponse>(
        API_ENDPOINTS.GUILDS.LIST
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get guild details
   */
  async getGuild(guildId: number): Promise<Guild> {
    try {
      
      const response = await apiClient.get<Guild>(
        API_ENDPOINTS.GUILDS.GET(guildId)
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new guild
   */
  async createGuild(guildData: {
    name: string;
    description: string;
    maxMembers?: number;
  }): Promise<Guild> {
    try {
      
      const response = await apiClient.post<Guild>(
        API_ENDPOINTS.GUILDS.CREATE,
        guildData
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Join a guild
   */
  async joinGuild(guildId: number, childId: number): Promise<void> {
    try {
      
      await apiClient.post(
        API_ENDPOINTS.GUILDS.JOIN(guildId),
        { child: `/api/children/${childId}` }
      );
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Leave a guild
   */
  async leaveGuild(guildId: number, childId: number): Promise<void> {
    try {
      
      await apiClient.post(
        API_ENDPOINTS.GUILDS.LEAVE(guildId),
        { child: `/api/children/${childId}` }
      );
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get guild members
   */
  async getGuildMembers(guildId: number): Promise<GuildMember[]> {
    try {
      
      const response = await apiClient.get<{ members: GuildMember[] }>(
        API_ENDPOINTS.GUILDS.MEMBERS(guildId)
      );
      
      return response.members || response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invite to guild
   */
  async inviteToGuild(guildId: number, childId: number): Promise<GuildInvitation> {
    try {
      
      const response = await apiClient.post<GuildInvitation>(
        API_ENDPOINTS.GUILDS.INVITE(guildId),
        { child: `/api/children/${childId}` }
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const guildsService = new GuildsService();