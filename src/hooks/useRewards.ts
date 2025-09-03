import { useCallback, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchRewardsAsync,
  fetchAvailableRewardsAsync,
  fetchChildRewardsAsync,
  fetchRewardByIdAsync,
  createRewardAsync,
  updateRewardAsync,
  deleteRewardAsync,
  fetchRewardClaimsAsync,
  claimRewardAsync,
  validateRewardClaimAsync,
  rejectRewardClaimAsync,
  fetchRewardRecommendationsAsync,
  fetchChildRewardRecommendationsAsync,
  selectReward,
  clearError,
  setFilters,
  clearFilters,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  claimRewardOptimistic,
} from '../store/slices/rewardsSlice';
import {
  selectAllRewards,
  selectSelectedReward,
  selectRewardsLoading,
  selectRewardsError,
  selectRewardClaims,
  selectRewardCart,
  selectRewardRecommendations,
  selectAvailableRewardsEnhanced,
  selectChildRewards,
  selectPendingClaims,
  selectApprovedClaims,
  selectRejectedClaims,
} from '../store/store';
import { 
  CreateRewardRequest, 
  UpdateRewardRequest,
  RewardCategory,
  RewardType,
  RewardClaimStatus 
} from '../types/api/rewards';
import { AgeGroup } from '../types/api/children';
import type { RewardCartItem } from '../types/app/store';

export const useRewards = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const rewards = useAppSelector(selectAllRewards);
  const selectedReward = useAppSelector(selectSelectedReward);
  const isLoading = useAppSelector(selectRewardsLoading);
  const error = useAppSelector(selectRewardsError);
  const claims = useAppSelector(selectRewardClaims);
  const cart = useAppSelector(selectRewardCart);
  const recommendations = useAppSelector(selectRewardRecommendations);
  const availableRewards = useAppSelector(selectAvailableRewardsEnhanced);
  const childRewards = useAppSelector(selectChildRewards);
  const pendingClaims = useAppSelector(selectPendingClaims);
  const approvedClaims = useAppSelector(selectApprovedClaims);
  const rejectedClaims = useAppSelector(selectRejectedClaims);

  // Fetch rewards and claims on mount if empty
  useEffect(() => {
    if (rewards.length === 0 && !isLoading) {
      dispatch(fetchRewardsAsync());
    }
    if (claims.length === 0 && !isLoading) {
      dispatch(fetchRewardClaimsAsync());
    }
  }, []);

  // Actions
  const fetchRewards = useCallback(async (filters?: {
    child?: number;
    available?: boolean;
    category?: RewardCategory;
  }) => {
    return dispatch(fetchRewardsAsync(filters));
  }, [dispatch]);

  const fetchAvailableRewards = useCallback(async () => {
    return dispatch(fetchAvailableRewardsAsync());
  }, [dispatch]);

  const fetchChildRewards = useCallback(async (childId: number) => {
    return dispatch(fetchChildRewardsAsync(childId));
  }, [dispatch]);

  const fetchRewardById = useCallback(async (rewardId: number) => {
    return dispatch(fetchRewardByIdAsync(rewardId));
  }, [dispatch]);

  const createReward = useCallback(async (rewardData: CreateRewardRequest) => {
    return dispatch(createRewardAsync(rewardData));
  }, [dispatch]);

  const updateReward = useCallback(async (id: number, updates: UpdateRewardRequest) => {
    return dispatch(updateRewardAsync({ id, updates }));
  }, [dispatch]);

  const deleteReward = useCallback(async (rewardId: number) => {
    return dispatch(deleteRewardAsync(rewardId));
  }, [dispatch]);

  // Claims management
  const fetchClaims = useCallback(async () => {
    return dispatch(fetchRewardClaimsAsync());
  }, [dispatch]);

  const claimReward = useCallback(async (rewardId: number, childId: number) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      // Optimistic update
      dispatch(claimRewardOptimistic({ reward, childId, tempId: `temp_${Date.now()}` }));
    }
    return dispatch(claimRewardAsync({ rewardId, childId }));
  }, [dispatch, rewards]);

  const validateClaim = useCallback(async (claimId: number) => {
    return dispatch(validateRewardClaimAsync(claimId));
  }, [dispatch]);

  const rejectClaim = useCallback(async (claimId: number, reason?: string) => {
    return dispatch(rejectRewardClaimAsync({ claimId, reason }));
  }, [dispatch]);

  // Recommendations
  const fetchRecommendations = useCallback(async (ageGroup: AgeGroup) => {
    return dispatch(fetchRewardRecommendationsAsync(ageGroup));
  }, [dispatch]);

  const fetchChildRecommendations = useCallback(async (childId: number, ageGroup: AgeGroup) => {
    return dispatch(fetchChildRewardRecommendationsAsync({ childId, ageGroup }));
  }, [dispatch]);

  // UI actions
  const selectRewardAction = useCallback((reward: any) => {
    dispatch(selectReward(reward));
  }, [dispatch]);

  const setRewardFilters = useCallback((filters: any) => {
    dispatch(setFilters(filters));
  }, [dispatch]);

  const clearRewardFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearRewardsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Cart management
  const addItemToCart = useCallback((item: RewardCartItem) => {
    dispatch(addToCart(item));
  }, [dispatch]);

  const removeItemFromCart = useCallback((rewardId: string, childId: string) => {
    dispatch(removeFromCart({ rewardId, childId }));
  }, [dispatch]);

  const updateCartItemAction = useCallback((update: {
    rewardId: string;
    childId: string;
    quantity?: number;
    notes?: string;
  }) => {
    dispatch(updateCartItem(update));
  }, [dispatch]);

  const clearCartAction = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  // Helper functions
  const getRewardsForChild = useCallback((childId: number) => {
    return childRewards[childId] || [];
  }, [childRewards]);

  const getRewardsByCategory = useCallback((category: RewardCategory) => {
    return rewards.filter(reward => reward.category === category);
  }, [rewards]);

  const getRewardsByPointsRange = useCallback((min: number, max: number) => {
    return rewards.filter(reward => 
      reward.pointsCost >= min && reward.pointsCost <= max
    );
  }, [rewards]);

  const getClaimsByStatus = useCallback((status: RewardClaimStatus) => {
    return claims.filter(claim => claim.status === status);
  }, [claims]);

  const getClaimsForChild = useCallback((childId: number) => {
    return claims.filter(claim => claim.child === `/api/children/${childId}`);
  }, [claims]);

  const canChildAfford = useCallback((reward: any, childPoints: number) => {
    return childPoints >= reward.pointsCost;
  }, []);

  // Computed values
  const rewardStats = useMemo(() => ({
    total: rewards.length,
    available: availableRewards.length,
    totalClaims: claims.length,
    pendingClaims: pendingClaims.length,
    approvedClaims: approvedClaims.length,
    rejectedClaims: rejectedClaims.length,
  }), [rewards, availableRewards, claims, pendingClaims, approvedClaims, rejectedClaims]);

  const rewardsByCategory = useMemo(() => {
    const categories: Record<RewardCategory, typeof rewards> = {
      general: [],
      entertainment: [],
      screen_time: [],
      toy: [],
      outing: [],
      money: [],
      food: [],
      education: [],
      social: [],
      subscription: [],
      gaming: [],
      privilege: [],
      shopping: [],
    };
    
    rewards.forEach(reward => {
      if (reward.category) {
        categories[reward.category].push(reward);
      }
    });
    
    return categories;
  }, [rewards]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const reward = rewards.find(r => r.id.toString() === item.rewardId);
      return total + (reward ? reward.pointsCost * item.quantity : 0);
    }, 0);
  }, [cart, rewards]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const mostPopularRewards = useMemo(() => {
    const rewardCounts: Record<string, number> = {};
    
    approvedClaims.forEach(claim => {
      const rewardId = claim.reward?.split('/').pop();
      if (rewardId) {
        rewardCounts[rewardId] = (rewardCounts[rewardId] || 0) + 1;
      }
    });
    
    return rewards
      .map(reward => ({
        ...reward,
        claimCount: rewardCounts[reward.id.toString()] || 0,
      }))
      .sort((a, b) => b.claimCount - a.claimCount)
      .slice(0, 10);
  }, [rewards, approvedClaims]);

  const recentClaims = useMemo(() => {
    return [...claims]
      .sort((a, b) => new Date(b.claimedAt || 0).getTime() - new Date(a.claimedAt || 0).getTime())
      .slice(0, 10);
  }, [claims]);

  const expensiveRewards = useMemo(() => {
    return [...rewards]
      .filter(reward => reward.available)
      .sort((a, b) => b.pointsCost - a.pointsCost)
      .slice(0, 5);
  }, [rewards]);

  const affordableRewards = useCallback((childPoints: number) => {
    return availableRewards
      .filter(reward => reward.pointsCost <= childPoints)
      .sort((a, b) => a.pointsCost - b.pointsCost);
  }, [availableRewards]);

  return {
    // State
    rewards,
    selectedReward,
    isLoading,
    error,
    claims,
    cart,
    recommendations,
    availableRewards,
    childRewards,
    pendingClaims,
    approvedClaims,
    rejectedClaims,
    
    // Actions
    fetchRewards,
    fetchAvailableRewards,
    fetchChildRewards,
    fetchRewardById,
    createReward,
    updateReward,
    deleteReward,
    fetchClaims,
    claimReward,
    validateClaim,
    rejectClaim,
    fetchRecommendations,
    fetchChildRecommendations,
    selectReward: selectRewardAction,
    setFilters: setRewardFilters,
    clearFilters: clearRewardFilters,
    clearError: clearRewardsError,
    
    // Cart management
    addToCart: addItemToCart,
    removeFromCart: removeItemFromCart,
    updateCartItem: updateCartItemAction,
    clearCart: clearCartAction,
    
    // Helpers
    getRewardsForChild,
    getRewardsByCategory,
    getRewardsByPointsRange,
    getClaimsByStatus,
    getClaimsForChild,
    canChildAfford,
    affordableRewards,
    
    // Computed values
    rewardStats,
    rewardsByCategory,
    cartTotal,
    cartItemsCount,
    mostPopularRewards,
    recentClaims,
    expensiveRewards,
    hasRewards: rewards.length > 0,
    hasCart: cart.length > 0,
  };
};