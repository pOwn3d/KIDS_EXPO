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
      console.log('⚔️ Fetching guilds...');
      
      const response = await apiClient.get<GuildsCollectionResponse>(
        API_ENDPOINTS.GUILDS.LIST
      );
      
      console.log('✅ Guilds loaded:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching guilds:', error);
      throw error;
    }
  }

  /**
   * Get guild details
   */
  async getGuild(guildId: number): Promise<Guild> {
    try {
      console.log(`⚔️ Fetching guild ${guildId}...`);
      
      const response = await apiClient.get<Guild>(
        API_ENDPOINTS.GUILDS.GET(guildId)
      );
      
      console.log('✅ Guild loaded:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching guild ${guildId}:`, error);
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
      console.log('⚔️ Creating guild...');
      
      const response = await apiClient.post<Guild>(
        API_ENDPOINTS.GUILDS.CREATE,
        guildData
      );
      
      console.log('✅ Guild created:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating guild:', error);
      throw error;
    }
  }

  /**
   * Join a guild
   */
  async joinGuild(guildId: number, childId: number): Promise<void> {
    try {
      console.log(`⚔️ Joining guild ${guildId}...`);
      
      await apiClient.post(
        API_ENDPOINTS.GUILDS.JOIN(guildId),
        { child: `/api/children/${childId}` }
      );
      
      console.log('✅ Guild joined successfully');
    } catch (error) {
      console.error(`❌ Error joining guild ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Leave a guild
   */
  async leaveGuild(guildId: number, childId: number): Promise<void> {
    try {
      console.log(`⚔️ Leaving guild ${guildId}...`);
      
      await apiClient.post(
        API_ENDPOINTS.GUILDS.LEAVE(guildId),
        { child: `/api/children/${childId}` }
      );
      
      console.log('✅ Left guild successfully');
    } catch (error) {
      console.error(`❌ Error leaving guild ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Get guild members
   */
  async getGuildMembers(guildId: number): Promise<GuildMember[]> {
    try {
      console.log(`⚔️ Fetching guild ${guildId} members...`);
      
      const response = await apiClient.get<{ members: GuildMember[] }>(
        API_ENDPOINTS.GUILDS.MEMBERS(guildId)
      );
      
      console.log('✅ Guild members loaded:', response);
      return response.members || response;
    } catch (error) {
      console.error(`❌ Error fetching guild members:`, error);
      throw error;
    }
  }

  /**
   * Invite to guild
   */
  async inviteToGuild(guildId: number, childId: number): Promise<GuildInvitation> {
    try {
      console.log(`⚔️ Inviting to guild ${guildId}...`);
      
      const response = await apiClient.post<GuildInvitation>(
        API_ENDPOINTS.GUILDS.INVITE(guildId),
        { child: `/api/children/${childId}` }
      );
      
      console.log('✅ Invitation sent:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error sending guild invitation:`, error);
      throw error;
    }
  }
}

export const guildsService = new GuildsService();