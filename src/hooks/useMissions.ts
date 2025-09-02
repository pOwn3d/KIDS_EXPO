import { useCallback, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchMissionsAsync,
  fetchChildMissionsAsync,
  fetchMissionByIdAsync,
  createMissionAsync,
  updateMissionAsync,
  deleteMissionAsync,
  completeMissionAsync,
  validateMissionAsync,
  assignMissionAsync,
  fetchMissionRecommendationsAsync,
  fetchChildMissionRecommendationsAsync,
  selectMission,
  clearError,
  setFilters,
  clearFilters,
  completeMissionOptimistic,
} from '../store/slices/missionsSlice';
import {
  selectAllMissions,
  selectSelectedMission,
  selectMissionsLoading,
  selectMissionsError,
  selectMissionRecommendations,
  selectMissionsByChild,
  selectActiveMissions,
  selectCompletedMissions,
} from '../store/store';
import { 
  CreateMissionRequest, 
  UpdateMissionRequest,
  MissionStatus,
  MissionCategory,
  MissionDifficulty 
} from '../types/api/missions';
import { AgeGroup } from '../types/api/children';

export const useMissions = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const missions = useAppSelector(selectAllMissions);
  const selectedMission = useAppSelector(selectSelectedMission);
  const isLoading = useAppSelector(selectMissionsLoading);
  const error = useAppSelector(selectMissionsError);
  const recommendations = useAppSelector(selectMissionRecommendations);
  const missionsByChild = useAppSelector(selectMissionsByChild);
  const activeMissions = useAppSelector(selectActiveMissions);
  const completedMissions = useAppSelector(selectCompletedMissions);

  // Fetch missions on mount if empty
  useEffect(() => {
    if (missions.length === 0 && !isLoading) {
      console.log('🎯 useMissions: Fetching missions on mount...');
      dispatch(fetchMissionsAsync());
    }
  }, []);

  // Actions
  const fetchMissions = useCallback(async (params?: { childId?: number; status?: MissionStatus }) => {
    return dispatch(fetchMissionsAsync(params));
  }, [dispatch]);

  const fetchChildMissions = useCallback(async (childId: number, status?: MissionStatus) => {
    return dispatch(fetchChildMissionsAsync({ childId, status }));
  }, [dispatch]);

  const fetchMissionById = useCallback(async (missionId: number) => {
    return dispatch(fetchMissionByIdAsync(missionId));
  }, [dispatch]);

  const createMission = useCallback(async (missionData: CreateMissionRequest) => {
    return dispatch(createMissionAsync(missionData));
  }, [dispatch]);

  const updateMission = useCallback(async (id: number, updates: UpdateMissionRequest) => {
    return dispatch(updateMissionAsync({ id, updates }));
  }, [dispatch]);

  const deleteMission = useCallback(async (missionId: number) => {
    return dispatch(deleteMissionAsync(missionId));
  }, [dispatch]);

  const completeMission = useCallback(async (missionId: number, childId: number, evidence?: string) => {
    // Optimistic update
    dispatch(completeMissionOptimistic({ missionId, childId }));
    return dispatch(completeMissionAsync({ missionId, childId, evidence }));
  }, [dispatch]);

  const validateMission = useCallback(async (
    missionId: number, 
    childId: number, 
    approved: boolean, 
    feedback?: string
  ) => {
    return dispatch(validateMissionAsync({ missionId, childId, approved, feedback }));
  }, [dispatch]);

  const assignMission = useCallback(async (missionId: number, childId: number, dueDate?: string) => {
    return dispatch(assignMissionAsync({ missionId, childId, dueDate }));
  }, [dispatch]);

  const fetchRecommendations = useCallback(async (ageGroup: AgeGroup) => {
    return dispatch(fetchMissionRecommendationsAsync(ageGroup));
  }, [dispatch]);

  const fetchChildRecommendations = useCallback(async (childId: number, ageGroup: AgeGroup) => {
    return dispatch(fetchChildMissionRecommendationsAsync({ childId, ageGroup }));
  }, [dispatch]);

  const selectMissionAction = useCallback((mission: any) => {
    dispatch(selectMission(mission));
  }, [dispatch]);

  const setMissionFilters = useCallback((filters: any) => {
    dispatch(setFilters(filters));
  }, [dispatch]);

  const clearMissionFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearMissionsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Helper functions
  const getMissionsForChild = useCallback((childId: number) => {
    return missionsByChild[childId] || [];
  }, [missionsByChild]);

  const getMissionsByStatus = useCallback((status: MissionStatus) => {
    return missions.filter(mission => mission.status === status);
  }, [missions]);

  const getMissionsByCategory = useCallback((category: MissionCategory) => {
    return missions.filter(mission => mission.category === category);
  }, [missions]);

  const getMissionsByDifficulty = useCallback((difficulty: MissionDifficulty) => {
    return missions.filter(mission => mission.difficulty === difficulty);
  }, [missions]);

  // Computed values
  const missionStats = useMemo(() => ({
    total: missions.length,
    active: activeMissions.length,
    completed: completedMissions.length,
    pending: missions.filter(m => m.status === 'pending').length,
    inProgress: missions.filter(m => m.status === 'in_progress').length,
    validated: missions.filter(m => m.status === 'validated').length,
  }), [missions, activeMissions, completedMissions]);

  const missionsByStatus = useMemo(() => {
    const groups: Record<MissionStatus, typeof missions> = {
      pending: [],
      in_progress: [],
      completed: [],
      validated: [],
      rejected: [],
      expired: [],
    };
    
    missions.forEach(mission => {
      if (mission.status) {
        groups[mission.status].push(mission);
      }
    });
    
    return groups;
  }, [missions]);

  const recentMissions = useMemo(() => {
    return [...missions]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);
  }, [missions]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return missions
      .filter(mission => mission.dueDate && mission.status === 'in_progress')
      .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
      .slice(0, 5);
  }, [missions]);

  const averageCompletionTime = useMemo(() => {
    const completedWithTimes = completedMissions.filter(m => m.completedAt && m.assignedAt);
    if (completedWithTimes.length === 0) return 0;
    
    const totalTime = completedWithTimes.reduce((sum, mission) => {
      const assigned = new Date(mission.assignedAt!).getTime();
      const completed = new Date(mission.completedAt!).getTime();
      return sum + (completed - assigned);
    }, 0);
    
    return Math.round(totalTime / completedWithTimes.length / (1000 * 60 * 60 * 24)); // days
  }, [completedMissions]);

  return {
    // State
    missions,
    selectedMission,
    isLoading,
    error,
    recommendations,
    missionsByChild,
    activeMissions,
    completedMissions,
    
    // Actions
    fetchMissions,
    fetchChildMissions,
    fetchMissionById,
    createMission,
    updateMission,
    deleteMission,
    completeMission,
    validateMission,
    assignMission,
    fetchRecommendations,
    fetchChildRecommendations,
    selectMission: selectMissionAction,
    setFilters: setMissionFilters,
    clearFilters: clearMissionFilters,
    clearError: clearMissionsError,
    
    // Helpers
    getMissionsForChild,
    getMissionsByStatus,
    getMissionsByCategory,
    getMissionsByDifficulty,
    
    // Computed values
    missionStats,
    missionsByStatus,
    recentMissions,
    upcomingDeadlines,
    averageCompletionTime,
    hasMissions: missions.length > 0,
  };
};