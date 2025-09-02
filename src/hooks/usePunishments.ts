import { useCallback, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchPunishmentsAsync,
  fetchPunishmentByIdAsync,
  createPunishmentAsync,
  updatePunishmentAsync,
  deletePunishmentAsync,
  applyPunishmentAsync,
  fetchActivePunishmentsAsync,
  fetchPunishmentHistoryAsync,
  fetchPunishmentRecommendationsAsync,
  fetchChildPunishmentRecommendationsAsync,
  deactivateAppliedPunishmentAsync,
  selectPunishment,
  clearError,
  setFilters,
  clearFilters,
  applyPunishmentOptimistic,
} from '../store/slices/punishmentsSlice';
import {
  selectAllPunishments,
  selectSelectedPunishment,
  selectPunishmentsLoading,
  selectPunishmentsError,
  selectPunishmentRecommendations,
  selectActivePunishmentsByChild,
  selectPunishmentHistoryByChild,
  selectActivePunishmentsForChild,
  selectPunishmentHistoryForChild,
} from '../store/store';
import { 
  CreatePunishmentRequest, 
  UpdatePunishmentRequest,
  PunishmentCategory,
  PunishmentDifficulty 
} from '../types/api/punishments';
import { AgeGroup } from '../types/api/children';

export const usePunishments = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const punishments = useAppSelector(selectAllPunishments);
  const selectedPunishment = useAppSelector(selectSelectedPunishment);
  const isLoading = useAppSelector(selectPunishmentsLoading);
  const error = useAppSelector(selectPunishmentsError);
  const recommendations = useAppSelector(selectPunishmentRecommendations);
  const activePunishmentsByChild = useAppSelector(selectActivePunishmentsByChild);
  const historyByChild = useAppSelector(selectPunishmentHistoryByChild);

  // Fetch punishments on mount if empty
  useEffect(() => {
    if (punishments.length === 0 && !isLoading) {
      console.log('⚠️ usePunishments: Fetching punishments on mount...');
      dispatch(fetchPunishmentsAsync());
    }
  }, []);

  // Actions
  const fetchPunishments = useCallback(async (filters?: {
    ageGroup?: AgeGroup;
    category?: PunishmentCategory;
    difficulty?: PunishmentDifficulty;
    isActive?: boolean;
  }) => {
    return dispatch(fetchPunishmentsAsync(filters));
  }, [dispatch]);

  const fetchPunishmentById = useCallback(async (punishmentId: number) => {
    return dispatch(fetchPunishmentByIdAsync(punishmentId));
  }, [dispatch]);

  const createPunishment = useCallback(async (punishmentData: CreatePunishmentRequest) => {
    return dispatch(createPunishmentAsync(punishmentData));
  }, [dispatch]);

  const updatePunishment = useCallback(async (id: number, updates: UpdatePunishmentRequest) => {
    return dispatch(updatePunishmentAsync({ id, updates }));
  }, [dispatch]);

  const deletePunishment = useCallback(async (punishmentId: number) => {
    return dispatch(deletePunishmentAsync(punishmentId));
  }, [dispatch]);

  const applyPunishment = useCallback(async (
    punishmentId: number, 
    childId: number, 
    reason?: string, 
    duration?: number
  ) => {
    const punishment = punishments.find(p => p.id === punishmentId);
    if (punishment) {
      // Optimistic update
      dispatch(applyPunishmentOptimistic({ 
        punishment, 
        childId, 
        tempId: `temp_${Date.now()}` 
      }));
    }
    return dispatch(applyPunishmentAsync({ punishmentId, childId, reason, duration }));
  }, [dispatch, punishments]);

  const fetchActivePunishments = useCallback(async (childId: number) => {
    return dispatch(fetchActivePunishmentsAsync(childId));
  }, [dispatch]);

  const fetchPunishmentHistory = useCallback(async (childId: number) => {
    return dispatch(fetchPunishmentHistoryAsync(childId));
  }, [dispatch]);

  const fetchRecommendations = useCallback(async (ageGroup: AgeGroup) => {
    return dispatch(fetchPunishmentRecommendationsAsync(ageGroup));
  }, [dispatch]);

  const fetchChildRecommendations = useCallback(async (childId: number, ageGroup: AgeGroup) => {
    return dispatch(fetchChildPunishmentRecommendationsAsync({ childId, ageGroup }));
  }, [dispatch]);

  const deactivatePunishment = useCallback(async (appliedPunishmentId: number, childId: number) => {
    return dispatch(deactivateAppliedPunishmentAsync({ appliedPunishmentId, childId }));
  }, [dispatch]);

  // UI actions
  const selectPunishmentAction = useCallback((punishment: any) => {
    dispatch(selectPunishment(punishment));
  }, [dispatch]);

  const setPunishmentFilters = useCallback((filters: any) => {
    dispatch(setFilters(filters));
  }, [dispatch]);

  const clearPunishmentFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearPunishmentsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Helper functions
  const getActivePunishmentsForChild = useCallback((childId: string | number) => {
    return useAppSelector(state => selectActivePunishmentsForChild(state, childId));
  }, []);

  const getPunishmentHistoryForChild = useCallback((childId: string | number) => {
    return useAppSelector(state => selectPunishmentHistoryForChild(state, childId));
  }, []);

  const getPunishmentsByCategory = useCallback((category: PunishmentCategory) => {
    return punishments.filter(punishment => punishment.category === category);
  }, [punishments]);

  const getPunishmentsByDifficulty = useCallback((difficulty: PunishmentDifficulty) => {
    return punishments.filter(punishment => punishment.difficulty === difficulty);
  }, [punishments]);

  const getPunishmentsByAgeGroup = useCallback((ageGroup: AgeGroup) => {
    return punishments.filter(punishment => punishment.ageGroup === ageGroup);
  }, [punishments]);

  const isChildRestricted = useCallback((childId: string | number) => {
    const activePunishments = activePunishmentsByChild[childId] || [];
    return activePunishments.length > 0;
  }, [activePunishmentsByChild]);

  const getActiveRestrictions = useCallback((childId: string | number) => {
    return activePunishmentsByChild[childId] || [];
  }, [activePunishmentsByChild]);

  // Computed values
  const punishmentStats = useMemo(() => ({
    total: punishments.length,
    active: punishments.filter(p => p.isActive).length,
    byCategory: {
      general: punishments.filter(p => p.category === 'general').length,
      digital: punishments.filter(p => p.category === 'digital').length,
      physical: punishments.filter(p => p.category === 'physical').length,
      social: punishments.filter(p => p.category === 'social').length,
      educational: punishments.filter(p => p.category === 'educational').length,
    },
    byDifficulty: {
      easy: punishments.filter(p => p.difficulty === 'easy').length,
      medium: punishments.filter(p => p.difficulty === 'medium').length,
      hard: punishments.filter(p => p.difficulty === 'hard').length,
    },
  }), [punishments]);

  const punishmentsByCategory = useMemo(() => {
    const categories: Record<PunishmentCategory, typeof punishments> = {
      general: [],
      digital: [],
      physical: [],
      social: [],
      educational: [],
    };
    
    punishments.forEach(punishment => {
      if (punishment.category) {
        categories[punishment.category].push(punishment);
      }
    });
    
    return categories;
  }, [punishments]);

  const punishmentsByDifficulty = useMemo(() => {
    const difficulties: Record<PunishmentDifficulty, typeof punishments> = {
      easy: [],
      medium: [],
      hard: [],
    };
    
    punishments.forEach(punishment => {
      if (punishment.difficulty) {
        difficulties[punishment.difficulty].push(punishment);
      }
    });
    
    return difficulties;
  }, [punishments]);

  const totalActivePunishments = useMemo(() => {
    return Object.values(activePunishmentsByChild)
      .flat()
      .filter(ap => ap.isActive).length;
  }, [activePunishmentsByChild]);

  const mostUsedPunishments = useMemo(() => {
    const punishmentCounts: Record<string, number> = {};
    
    Object.values(historyByChild).flat().forEach(appliedPunishment => {
      const punishmentId = appliedPunishment.punishment?.split('/').pop();
      if (punishmentId) {
        punishmentCounts[punishmentId] = (punishmentCounts[punishmentId] || 0) + 1;
      }
    });
    
    return punishments
      .map(punishment => ({
        ...punishment,
        usageCount: punishmentCounts[punishment.id.toString()] || 0,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);
  }, [punishments, historyByChild]);

  const recentlyApplied = useMemo(() => {
    const allApplied = Object.values(historyByChild).flat();
    return allApplied
      .sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime())
      .slice(0, 10);
  }, [historyByChild]);

  const childrenWithActivePunishments = useMemo(() => {
    return Object.entries(activePunishmentsByChild)
      .filter(([_, punishments]) => punishments.length > 0)
      .map(([childId, punishments]) => ({
        childId,
        activePunishments: punishments,
        count: punishments.length,
      }));
  }, [activePunishmentsByChild]);

  const averagePunishmentDuration = useMemo(() => {
    const completedPunishments = Object.values(historyByChild)
      .flat()
      .filter(ap => ap.appliedAt && ap.expiresAt && !ap.isActive);
    
    if (completedPunishments.length === 0) return 0;
    
    const totalDuration = completedPunishments.reduce((sum, punishment) => {
      const applied = new Date(punishment.appliedAt!).getTime();
      const expired = new Date(punishment.expiresAt!).getTime();
      return sum + (expired - applied);
    }, 0);
    
    return Math.round(totalDuration / completedPunishments.length / (1000 * 60 * 60 * 24)); // days
  }, [historyByChild]);

  return {
    // State
    punishments,
    selectedPunishment,
    isLoading,
    error,
    recommendations,
    activePunishmentsByChild,
    historyByChild,
    
    // Actions
    fetchPunishments,
    fetchPunishmentById,
    createPunishment,
    updatePunishment,
    deletePunishment,
    applyPunishment,
    fetchActivePunishments,
    fetchPunishmentHistory,
    fetchRecommendations,
    fetchChildRecommendations,
    deactivatePunishment,
    selectPunishment: selectPunishmentAction,
    setFilters: setPunishmentFilters,
    clearFilters: clearPunishmentFilters,
    clearError: clearPunishmentsError,
    
    // Helpers
    getActivePunishmentsForChild,
    getPunishmentHistoryForChild,
    getPunishmentsByCategory,
    getPunishmentsByDifficulty,
    getPunishmentsByAgeGroup,
    isChildRestricted,
    getActiveRestrictions,
    
    // Computed values
    punishmentStats,
    punishmentsByCategory,
    punishmentsByDifficulty,
    totalActivePunishments,
    mostUsedPunishments,
    recentlyApplied,
    childrenWithActivePunishments,
    averagePunishmentDuration,
    hasPunishments: punishments.length > 0,
  };
};