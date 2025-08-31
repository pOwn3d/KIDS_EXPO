import { apiClient, extractHydraCollection, getHydraTotalItems } from './client';
import { 
  Mission, 
  CreateMissionRequest, 
  UpdateMissionRequest, 
  MissionProgress,
  MissionCategory,
  MissionDifficulty,
  MissionStatus,
} from '../../types/api';
import { PaginatedResponse, RequestOptions, PaginationParams, FilterParams } from '../../types/api';

/**
 * Mission management service
 */
export class MissionsService {
  /**
   * Get paginated list of missions with filters
   */
  async getMissions(
    params?: PaginationParams & {
      status?: MissionStatus[];
      category?: MissionCategory[];
      difficulty?: MissionDifficulty[];
      assignedTo?: string;
      search?: string;
      dueDate?: {
        from?: string;
        to?: string;
      };
    },
    options?: RequestOptions
  ): Promise<{
    missions: Mission[];
    total: number;
    hasMore: boolean;
  }> {
    const searchParams: Record<string, any> = {};
    
    if (params?.page) searchParams.page = params.page;
    if (params?.itemsPerPage) searchParams.itemsPerPage = params.itemsPerPage;
    if (params?.order) {
      Object.entries(params.order).forEach(([key, value]) => {
        searchParams[`order[${key}]`] = value;
      });
    }
    if (params?.status) searchParams['status[]'] = params.status;
    if (params?.category) searchParams['category[]'] = params.category;
    if (params?.difficulty) searchParams['difficulty[]'] = params.difficulty;
    if (params?.assignedTo) searchParams.assignedTo = params.assignedTo;
    if (params?.search) searchParams.search = params.search;
    if (params?.dueDate?.from) searchParams['dueDate[after]'] = params.dueDate.from;
    if (params?.dueDate?.to) searchParams['dueDate[before]'] = params.dueDate.to;

    const response = await apiClient.get<PaginatedResponse<Mission>>(
      '/missions',
      searchParams,
      options
    );

    const missions = extractHydraCollection(response);
    const total = getHydraTotalItems(response);
    const currentPage = params?.page || 1;
    const itemsPerPage = params?.itemsPerPage || 20;
    const hasMore = currentPage * itemsPerPage < total;

    return { missions, total, hasMore };
  }

  /**
   * Get mission by ID
   */
  async getMissionById(id: string, options?: RequestOptions): Promise<Mission> {
    return apiClient.get<Mission>(`/missions/${id}`, undefined, options);
  }

  /**
   * Create new mission
   */
  async createMission(data: CreateMissionRequest, options?: RequestOptions): Promise<Mission> {
    return apiClient.post<Mission>('/missions', data, options);
  }

  /**
   * Update existing mission
   */
  async updateMission(id: string, data: UpdateMissionRequest, options?: RequestOptions): Promise<Mission> {
    return apiClient.patch<Mission>(`/missions/${id}`, data, options);
  }

  /**
   * Delete mission
   */
  async deleteMission(id: string, options?: RequestOptions): Promise<void> {
    await apiClient.delete(`/missions/${id}`, options);
  }

  /**
   * Assign mission to child
   */
  async assignMission(
    missionId: string, 
    childId: string, 
    dueDate?: string,
    options?: RequestOptions
  ): Promise<Mission> {
    return apiClient.patch<Mission>(`/missions/${missionId}`, {
      assignedToId: childId,
      status: 'ASSIGNED',
      dueDate,
    }, options);
  }

  /**
   * Start mission (child action)
   */
  async startMission(missionId: string, options?: RequestOptions): Promise<Mission> {
    return apiClient.post<Mission>(`/missions/${missionId}/start`, {}, options);
  }

  /**
   * Submit mission for validation (child action)
   */
  async submitMission(
    missionId: string, 
    data: {
      notes?: string;
      attachments?: string[];
      requirementValues?: Record<string, any>;
    },
    options?: RequestOptions
  ): Promise<Mission> {
    return apiClient.post<Mission>(`/missions/${missionId}/submit`, data, options);
  }

  /**
   * Validate mission (parent action)
   */
  async validateMission(
    missionId: string, 
    approved: boolean, 
    feedback?: string,
    options?: RequestOptions
  ): Promise<Mission> {
    return apiClient.post<Mission>(`/missions/${missionId}/validate`, {
      approved,
      feedback,
    }, options);
  }

  /**
   * Reject mission submission (parent action)
   */
  async rejectMission(
    missionId: string, 
    reason: string,
    options?: RequestOptions
  ): Promise<Mission> {
    return apiClient.post<Mission>(`/missions/${missionId}/reject`, {
      reason,
    }, options);
  }

  /**
   * Get mission progress for a specific child
   */
  async getMissionProgress(
    missionId: string, 
    childId: string,
    options?: RequestOptions
  ): Promise<MissionProgress> {
    return apiClient.get<MissionProgress>(
      `/missions/${missionId}/progress/${childId}`,
      undefined,
      options
    );
  }

  /**
   * Update mission progress (child action)
   */
  async updateMissionProgress(
    missionId: string,
    data: Partial<MissionProgress>,
    options?: RequestOptions
  ): Promise<MissionProgress> {
    return apiClient.patch<MissionProgress>(
      `/missions/${missionId}/progress`,
      data,
      options
    );
  }

  /**
   * Get missions assigned to specific child
   */
  async getChildMissions(
    childId: string,
    status?: MissionStatus[],
    options?: RequestOptions
  ): Promise<Mission[]> {
    const params: Record<string, any> = {
      assignedTo: childId,
    };
    
    if (status) {
      params['status[]'] = status;
    }

    const response = await apiClient.get<PaginatedResponse<Mission>>(
      '/missions',
      params,
      options
    );

    return extractHydraCollection(response);
  }

  /**
   * Get mission templates
   */
  async getMissionTemplates(
    category?: MissionCategory,
    options?: RequestOptions
  ): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: MissionCategory;
    difficulty: MissionDifficulty;
    pointsReward: number;
    requirements: any[];
  }>> {
    const params = category ? { category } : undefined;
    
    const response = await apiClient.get<PaginatedResponse<any>>(
      '/missions/templates',
      params,
      options
    );

    return extractHydraCollection(response);
  }

  /**
   * Create mission from template
   */
  async createFromTemplate(
    templateId: string,
    overrides?: Partial<CreateMissionRequest>,
    options?: RequestOptions
  ): Promise<Mission> {
    return apiClient.post<Mission>(`/missions/templates/${templateId}/create`, overrides, options);
  }

  /**
   * Get mission categories with statistics
   */
  async getMissionCategories(options?: RequestOptions): Promise<Array<{
    category: MissionCategory;
    count: number;
    averagePoints: number;
    completionRate: number;
  }>> {
    return apiClient.get('/missions/categories/stats', undefined, options);
  }

  /**
   * Bulk assign missions to multiple children
   */
  async bulkAssignMissions(
    missionIds: string[],
    childIds: string[],
    dueDate?: string,
    options?: RequestOptions
  ): Promise<{ successful: Mission[]; failed: Array<{ missionId: string; error: string }> }> {
    return apiClient.post('/missions/bulk-assign', {
      missionIds,
      childIds,
      dueDate,
    }, options);
  }

  /**
   * Duplicate existing mission
   */
  async duplicateMission(
    missionId: string,
    overrides?: Partial<CreateMissionRequest>,
    options?: RequestOptions
  ): Promise<Mission> {
    return apiClient.post<Mission>(`/missions/${missionId}/duplicate`, overrides, options);
  }

  /**
   * Get mission activity feed
   */
  async getMissionActivity(
    missionId: string,
    options?: RequestOptions
  ): Promise<Array<{
    id: string;
    type: 'CREATED' | 'ASSIGNED' | 'STARTED' | 'PROGRESS' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED';
    timestamp: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    data: any;
    message: string;
  }>> {
    return apiClient.get(`/missions/${missionId}/activity`, undefined, options);
  }

  /**
   * Upload mission attachment
   */
  async uploadAttachment(
    missionId: string,
    file: any,
    type: 'image' | 'video' | 'document' = 'image',
    options?: RequestOptions
  ): Promise<{ url: string; id: string }> {
    return apiClient.upload(
      `/missions/${missionId}/attachments`,
      file,
      'file',
      { type }
    );
  }

  /**
   * Get mission statistics for dashboard
   */
  async getMissionStats(
    childId?: string,
    period: 'week' | 'month' | 'year' = 'month',
    options?: RequestOptions
  ): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    averageCompletionTime: number;
    totalPointsEarned: number;
    categoryBreakdown: Array<{
      category: MissionCategory;
      count: number;
      completed: number;
    }>;
  }> {
    const params: Record<string, any> = { period };
    if (childId) params.childId = childId;

    return apiClient.get('/missions/stats', params, options);
  }
}

// Create singleton instance
export const missionsService = new MissionsService();