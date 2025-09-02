import { useCallback, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchChildrenAsync,
  fetchChildByIdAsync,
  createChildAsync,
  updateChildAsync,
  deleteChildAsync,
  fetchChildStatisticsAsync,
  fetchChildActivitiesAsync,
  addPointsToChildAsync,
  selectChild,
  clearError,
  updateChildPointsLocally,
} from '../store/slices/childrenSlice';
import {
  selectAllChildren,
  selectSelectedChild,
  selectChildrenLoading,
  selectChildrenError,
  selectChildStatistics,
  selectChildActivities,
  selectChildStatisticsByChild,
  selectChildActivitiesByChild,
  selectChildProfile,
} from '../store/store';
import { CreateChildDto, UpdateChildDto, AgeGroup } from '../types/api/children';

export const useChildren = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const children = useAppSelector(selectAllChildren);
  const selectedChild = useAppSelector(selectSelectedChild);
  const isLoading = useAppSelector(selectChildrenLoading);
  const error = useAppSelector(selectChildrenError);
  const allStatistics = useAppSelector(selectChildStatistics);
  const allActivities = useAppSelector(selectChildActivities);

  // Fetch children on mount if empty
  useEffect(() => {
    if (children.length === 0 && !isLoading) {
      console.log('📱 useChildren: Fetching children on mount...');
      dispatch(fetchChildrenAsync());
    }
  }, []);

  // Actions
  const fetchChildren = useCallback(async () => {
    return dispatch(fetchChildrenAsync());
  }, [dispatch]);

  const fetchChildById = useCallback(async (childId: string | number) => {
    return dispatch(fetchChildByIdAsync(childId));
  }, [dispatch]);

  const createChild = useCallback(async (childData: CreateChildDto) => {
    return dispatch(createChildAsync(childData));
  }, [dispatch]);

  const updateChild = useCallback(async (id: string | number, updates: UpdateChildDto) => {
    return dispatch(updateChildAsync({ id, updates }));
  }, [dispatch]);

  const deleteChild = useCallback(async (childId: string | number) => {
    return dispatch(deleteChildAsync(childId));
  }, [dispatch]);

  const fetchStatistics = useCallback(async (childId: string | number) => {
    return dispatch(fetchChildStatisticsAsync(childId));
  }, [dispatch]);

  const fetchActivities = useCallback(async (childId: string | number, limit = 10) => {
    return dispatch(fetchChildActivitiesAsync({ childId, limit }));
  }, [dispatch]);

  const addPoints = useCallback(async (childId: string | number, points: number, reason?: string) => {
    // Optimistic update
    dispatch(updateChildPointsLocally({ childId, points }));
    return dispatch(addPointsToChildAsync({ childId, points, reason }));
  }, [dispatch]);

  const selectChildAction = useCallback((child: any) => {
    dispatch(selectChild(child));
  }, [dispatch]);

  const clearChildrenError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Helper function to get child statistics
  const getChildStatistics = useCallback((childId: string | number) => {
    return useAppSelector((state) => selectChildStatisticsByChild(state, childId));
  }, []);

  // Helper function to get child activities
  const getChildActivities = useCallback((childId: string | number) => {
    return useAppSelector((state) => selectChildActivitiesByChild(state, childId));
  }, []);

  // Helper function to get complete child profile
  const getChildProfile = useCallback((childId: string | number) => {
    return useAppSelector((state) => selectChildProfile(state, childId));
  }, []);

  // Computed values
  const childrenOptions = useMemo(() => 
    children.map(child => ({
      label: `${child.firstName} ${child.lastName}`,
      value: child.id,
      avatar: child.avatar,
      ageGroup: child.ageGroup,
    }))
  , [children]);

  const activeChildren = useMemo(() => 
    children.filter(child => child.isActive)
  , [children]);

  const childrenByAgeGroup = useMemo(() => {
    const groups: Record<AgeGroup, typeof children> = {
      '3-5': [],
      '6-8': [],
      '9-12': [],
      '13-17': [],
    };
    
    children.forEach(child => {
      if (child.ageGroup) {
        groups[child.ageGroup].push(child);
      }
    });
    
    return groups;
  }, [children]);

  const totalPoints = useMemo(() => 
    children.reduce((sum, child) => sum + (child.currentPoints || 0), 0)
  , [children]);

  const averageLevel = useMemo(() => {
    if (children.length === 0) return 0;
    const totalLevels = children.reduce((sum, child) => {
      const stats = allStatistics[child.id];
      return sum + (stats?.level || 1);
    }, 0);
    return Math.round(totalLevels / children.length);
  }, [children, allStatistics]);

  return {
    // State
    children,
    selectedChild,
    isLoading,
    error,
    allStatistics,
    allActivities,
    
    // Actions
    fetchChildren,
    fetchChildById,
    createChild,
    updateChild,
    deleteChild,
    fetchStatistics,
    fetchActivities,
    addPoints,
    selectChild: selectChildAction,
    clearError: clearChildrenError,
    
    // Helpers
    getChildStatistics,
    getChildActivities,
    getChildProfile,
    
    // Computed values
    childrenOptions,
    activeChildren,
    childrenByAgeGroup,
    totalPoints,
    averageLevel,
    hasChildren: children.length > 0,
  };
};