import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AsyncThunkConfig, RewardsState, RewardCartItem } from '../../types/app/store';
import { 
  Reward, 
  RewardClaim,
  CreateRewardRequest, 
  UpdateRewardRequest,
  RewardCategory,
  RewardClaimStatus
} from '../../types/api/rewards';
import { AgeGroup } from '../../types/api/children';
import { rewardsService } from '../../services/rewards.service';

// Enhanced initial state
const initialState: RewardsState = {
  rewards: [],
  claims: [],
  selectedReward: null,
  cart: [],
  categories: ['entertainment', 'screen_time', 'toy', 'outing', 'money', 'food', 'education', 'social', 'subscription', 'gaming', 'privilege', 'shopping'],
  filters: {},
  isLoading: false,
  error: null,
  lastSyncAt: null,
  // Nouveaux champs pour les fonctionnalités avancées
  recommendations: [],
  availableRewards: [],
  childRewards: {},
  pendingClaims: [],
  approvedClaims: [],
  rejectedClaims: [],
  syncStatus: 'idle',
};

// ===== ASYNC THUNKS =====

// Récupérer toutes les récompenses
export const fetchRewardsAsync = createAsyncThunk<
  Reward[],
  { child?: number; available?: boolean; category?: RewardCategory } | undefined,
  AsyncThunkConfig
>(
  'rewards/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const rewards = await rewardsService.getAllRewards(filters);
      return rewards;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch rewards');
    }
  }
);

// Récupérer les récompenses disponibles
export const fetchAvailableRewardsAsync = createAsyncThunk<
  Reward[],
  void,
  AsyncThunkConfig
>(
  'rewards/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const rewards = await rewardsService.getAvailableRewards();
      return rewards;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch available rewards');
    }
  }
);

// Récupérer les récompenses d'un enfant
export const fetchChildRewardsAsync = createAsyncThunk<
  { childId: number; rewards: Reward[] },
  number,
  AsyncThunkConfig
>(
  'rewards/fetchChildRewards',
  async (childId, { rejectWithValue }) => {
    try {
      const rewards = await rewardsService.getChildRewards(childId);
      return { childId, rewards };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch child rewards');
    }
  }
);

// Récupérer une récompense par ID
export const fetchRewardByIdAsync = createAsyncThunk<
  Reward,
  number,
  AsyncThunkConfig
>(
  'rewards/fetchById',
  async (rewardId, { rejectWithValue }) => {
    try {
      const reward = await rewardsService.getRewardById(rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }
      return reward;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reward');
    }
  }
);

// Créer une nouvelle récompense
export const createRewardAsync = createAsyncThunk<
  Reward,
  CreateRewardRequest,
  AsyncThunkConfig
>(
  'rewards/create',
  async (rewardData, { rejectWithValue }) => {
    try {
      const newReward = await rewardsService.createReward(rewardData);
      return newReward;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create reward');
    }
  }
);

// Mettre à jour une récompense
export const updateRewardAsync = createAsyncThunk<
  Reward,
  { id: number; updates: UpdateRewardRequest },
  AsyncThunkConfig
>(
  'rewards/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updatedReward = await rewardsService.updateReward(id, updates);
      return updatedReward;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update reward');
    }
  }
);

// Supprimer une récompense
export const deleteRewardAsync = createAsyncThunk<
  number,
  number,
  AsyncThunkConfig
>(
  'rewards/delete',
  async (rewardId, { rejectWithValue }) => {
    try {
      const success = await rewardsService.deleteReward(rewardId);
      if (!success) {
        throw new Error('Failed to delete reward');
      }
      return rewardId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete reward');
    }
  }
);

// ===== CLAIMS MANAGEMENT =====

// Récupérer toutes les demandes de récompenses
export const fetchRewardClaimsAsync = createAsyncThunk<
  RewardClaim[],
  void,
  AsyncThunkConfig
>(
  'rewards/fetchClaims',
  async (_, { rejectWithValue }) => {
    try {
      const claims = await rewardsService.getRewardClaims();
      return claims;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reward claims');
    }
  }
);

// Réclamer une récompense (enfant)
export const claimRewardAsync = createAsyncThunk<
  RewardClaim,
  { rewardId: number; childId: number },
  AsyncThunkConfig
>(
  'rewards/claim',
  async ({ rewardId, childId }, { rejectWithValue, dispatch }) => {
    try {
      const claim = await rewardsService.claimReward(rewardId, childId);
      
      // Actualiser la liste des demandes
      dispatch(fetchRewardClaimsAsync());
      
      return claim;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to claim reward');
    }
  }
);

// Valider une demande de récompense (parent)
export const validateRewardClaimAsync = createAsyncThunk<
  RewardClaim,
  number,
  AsyncThunkConfig
>(
  'rewards/validateClaim',
  async (claimId, { rejectWithValue, dispatch }) => {
    try {
      const validatedClaim = await rewardsService.validateRewardClaim(claimId);
      
      // Actualiser la liste des demandes
      dispatch(fetchRewardClaimsAsync());
      
      return validatedClaim;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to validate reward claim');
    }
  }
);

// Rejeter une demande de récompense (parent)
export const rejectRewardClaimAsync = createAsyncThunk<
  RewardClaim,
  { claimId: number; reason?: string },
  AsyncThunkConfig
>(
  'rewards/rejectClaim',
  async ({ claimId, reason }, { rejectWithValue, dispatch }) => {
    try {
      const rejectedClaim = await rewardsService.rejectRewardClaim(claimId, reason);
      
      // Actualiser la liste des demandes
      dispatch(fetchRewardClaimsAsync());
      
      return rejectedClaim;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject reward claim');
    }
  }
);

// ===== RECOMMENDATIONS =====

// Récupérer les recommandations de récompenses par âge
export const fetchRewardRecommendationsAsync = createAsyncThunk<
  Reward[],
  AgeGroup,
  AsyncThunkConfig
>(
  'rewards/fetchRecommendations',
  async (ageGroup, { rejectWithValue }) => {
    try {
      const recommendations = await rewardsService.getRewardRecommendationsByAge(ageGroup);
      return recommendations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reward recommendations');
    }
  }
);

// Récupérer les recommandations pour un enfant spécifique
export const fetchChildRewardRecommendationsAsync = createAsyncThunk<
  Reward[],
  { childId: number; ageGroup: AgeGroup },
  AsyncThunkConfig
>(
  'rewards/fetchChildRecommendations',
  async ({ childId, ageGroup }, { rejectWithValue }) => {
    try {
      const recommendations = await rewardsService.getRewardRecommendationsForChild(childId, ageGroup);
      return recommendations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch child reward recommendations');
    }
  }
);

// ===== SLICE =====
const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    // Actions synchrones
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    selectReward: (state, action: PayloadAction<Reward | null>) => {
      state.selectedReward = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // ===== CART MANAGEMENT =====
    addToCart: (state, action: PayloadAction<RewardCartItem>) => {
      const existingItem = state.cart.find(item => 
        item.rewardId === action.payload.rewardId && 
        item.childId === action.payload.childId
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        if (action.payload.notes) {
          existingItem.notes = action.payload.notes;
        }
      } else {
        state.cart.push(action.payload);
      }
    },
    
    removeFromCart: (state, action: PayloadAction<{ rewardId: string; childId: string }>) => {
      const { rewardId, childId } = action.payload;
      state.cart = state.cart.filter(item => 
        !(item.rewardId === rewardId && item.childId === childId)
      );
    },
    
    updateCartItem: (state, action: PayloadAction<{
      rewardId: string;
      childId: string;
      quantity?: number;
      notes?: string;
    }>) => {
      const { rewardId, childId, quantity, notes } = action.payload;
      const item = state.cart.find(item => 
        item.rewardId === rewardId && item.childId === childId
      );
      
      if (item) {
        if (quantity !== undefined) item.quantity = quantity;
        if (notes !== undefined) item.notes = notes;
      }
    },
    
    clearCart: (state) => {
      state.cart = [];
    },
    
    // Optimistic update pour la réclamation d'une récompense
    claimRewardOptimistic: (state, action: PayloadAction<{
      reward: Reward;
      childId: number;
      tempId: string;
    }>) => {
      const { reward, childId, tempId } = action.payload;
      
      // Créer une demande temporaire
      const tempClaim: RewardClaim = {
        '@type': 'RewardClaim',
        id: tempId, // ID temporaire
        reward: `/api/rewards/${reward.id}`,
        child: `/api/children/${childId}`,
        rewardName: reward.name,
        childName: '', // Sera mis à jour par l'API
        pointsCost: reward.pointsCost,
        status: 'pending',
        claimedAt: new Date().toISOString(),
        validatedAt: null,
        rejectedAt: null,
        notes: null,
      };
      
      state.claims.push(tempClaim);
      state.pendingClaims.push(tempClaim);
    },
    
    // Réinitialiser l'état
    resetRewardsState: () => initialState,
  },
  
  extraReducers: (builder) => {
    // ===== FETCH ALL REWARDS =====
    builder
      .addCase(fetchRewardsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.syncStatus = 'pending';
      })
      .addCase(fetchRewardsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rewards = action.payload;
        state.lastSyncAt = Date.now();
        state.syncStatus = 'succeeded';
        state.error = null;
      })
      .addCase(fetchRewardsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.syncStatus = 'failed';
      })
      
    // ===== FETCH AVAILABLE REWARDS =====
      .addCase(fetchAvailableRewardsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAvailableRewardsAsync.fulfilled, (state, action) => {
        state.availableRewards = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableRewardsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH CHILD REWARDS =====
      .addCase(fetchChildRewardsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchChildRewardsAsync.fulfilled, (state, action) => {
        const { childId, rewards } = action.payload;
        state.childRewards[childId] = rewards;
        state.error = null;
      })
      .addCase(fetchChildRewardsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH REWARD BY ID =====
      .addCase(fetchRewardByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRewardByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedReward = action.payload;
        const index = state.rewards.findIndex(r => r.id === updatedReward.id);
        if (index !== -1) {
          state.rewards[index] = updatedReward;
        } else {
          state.rewards.push(updatedReward);
        }
        state.error = null;
      })
      .addCase(fetchRewardByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== CREATE REWARD =====
      .addCase(createRewardAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRewardAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rewards.push(action.payload);
        
        // Ajouter aux récompenses disponibles si applicable
        if (action.payload.available) {
          state.availableRewards.push(action.payload);
        }
        
        state.error = null;
      })
      .addCase(createRewardAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== UPDATE REWARD =====
      .addCase(updateRewardAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRewardAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedReward = action.payload;
        const index = state.rewards.findIndex(r => r.id === updatedReward.id);
        if (index !== -1) {
          state.rewards[index] = updatedReward;
        }
        
        // Mettre à jour selectedReward si c'est la même
        if (state.selectedReward?.id === updatedReward.id) {
          state.selectedReward = updatedReward;
        }
        
        // Mettre à jour dans availableRewards
        const availableIndex = state.availableRewards.findIndex(r => r.id === updatedReward.id);
        if (updatedReward.available) {
          if (availableIndex !== -1) {
            state.availableRewards[availableIndex] = updatedReward;
          } else {
            state.availableRewards.push(updatedReward);
          }
        } else if (availableIndex !== -1) {
          state.availableRewards.splice(availableIndex, 1);
        }
        
        state.error = null;
      })
      .addCase(updateRewardAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== DELETE REWARD =====
      .addCase(deleteRewardAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRewardAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedRewardId = action.payload;
        state.rewards = state.rewards.filter(r => r.id !== deletedRewardId);
        state.availableRewards = state.availableRewards.filter(r => r.id !== deletedRewardId);
        
        // Désélectionner si c'était la récompense sélectionnée
        if (state.selectedReward?.id === deletedRewardId) {
          state.selectedReward = null;
        }
        
        // Nettoyer le panier
        state.cart = state.cart.filter(item => parseInt(item.rewardId) !== deletedRewardId);
        
        // Nettoyer des listes par enfant
        Object.keys(state.childRewards).forEach(childId => {
          state.childRewards[childId] = state.childRewards[childId].filter(r => r.id !== deletedRewardId);
        });
        
        state.error = null;
      })
      .addCase(deleteRewardAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== FETCH CLAIMS =====
      .addCase(fetchRewardClaimsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchRewardClaimsAsync.fulfilled, (state, action) => {
        state.claims = action.payload;
        
        // Séparer par statut
        state.pendingClaims = action.payload.filter(claim => claim.status === 'pending');
        state.approvedClaims = action.payload.filter(claim => claim.status === 'approved');
        state.rejectedClaims = action.payload.filter(claim => claim.status === 'rejected');
        
        state.error = null;
      })
      .addCase(fetchRewardClaimsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== CLAIM REWARD =====
      .addCase(claimRewardAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(claimRewardAsync.fulfilled, (state, action) => {
        const newClaim = action.payload;
        
        // Remplacer la demande temporaire si elle existe
        const tempIndex = state.claims.findIndex(claim => typeof claim.id === 'string');
        if (tempIndex !== -1) {
          state.claims[tempIndex] = newClaim;
        } else {
          state.claims.push(newClaim);
        }
        
        // Ajouter aux demandes en attente
        if (!state.pendingClaims.find(claim => claim.id === newClaim.id)) {
          state.pendingClaims.push(newClaim);
        }
        
        state.error = null;
      })
      .addCase(claimRewardAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // TODO: Revert optimistic update
      })
      
    // ===== VALIDATE CLAIM =====
      .addCase(validateRewardClaimAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(validateRewardClaimAsync.fulfilled, (state, action) => {
        const validatedClaim = action.payload;
        
        // Mettre à jour dans la liste principale
        const index = state.claims.findIndex(claim => claim.id === validatedClaim.id);
        if (index !== -1) {
          state.claims[index] = validatedClaim;
        }
        
        // Retirer des demandes en attente et ajouter aux approuvées
        state.pendingClaims = state.pendingClaims.filter(claim => claim.id !== validatedClaim.id);
        if (!state.approvedClaims.find(claim => claim.id === validatedClaim.id)) {
          state.approvedClaims.push(validatedClaim);
        }
        
        state.error = null;
      })
      .addCase(validateRewardClaimAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== REJECT CLAIM =====
      .addCase(rejectRewardClaimAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(rejectRewardClaimAsync.fulfilled, (state, action) => {
        const rejectedClaim = action.payload;
        
        // Mettre à jour dans la liste principale
        const index = state.claims.findIndex(claim => claim.id === rejectedClaim.id);
        if (index !== -1) {
          state.claims[index] = rejectedClaim;
        }
        
        // Retirer des demandes en attente et ajouter aux rejetées
        state.pendingClaims = state.pendingClaims.filter(claim => claim.id !== rejectedClaim.id);
        if (!state.rejectedClaims.find(claim => claim.id === rejectedClaim.id)) {
          state.rejectedClaims.push(rejectedClaim);
        }
        
        state.error = null;
      })
      .addCase(rejectRewardClaimAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH RECOMMENDATIONS =====
      .addCase(fetchRewardRecommendationsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchRewardRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchRewardRecommendationsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH CHILD RECOMMENDATIONS =====
      .addCase(fetchChildRewardRecommendationsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchChildRewardRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchChildRewardRecommendationsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  setLoading,
  selectReward,
  clearError,
  setFilters,
  clearFilters,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  claimRewardOptimistic,
  resetRewardsState,
} = rewardsSlice.actions;

// Export du reducer
export default rewardsSlice.reducer;