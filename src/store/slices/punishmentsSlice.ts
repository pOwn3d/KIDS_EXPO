import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AsyncThunkConfig, PunishmentsState, PunishmentFilters } from '../../types/app/store';
import { 
  Punishment, 
  AppliedPunishment,
  CreatePunishmentRequest,
  UpdatePunishmentRequest,
  PunishmentCategory,
  PunishmentDifficulty
} from '../../types/api/punishments';
import { AgeGroup } from '../../types/api/children';
import { punishmentsService } from '../../services/punishments.service';

// Initial state
const initialState: PunishmentsState = {
  punishments: [],
  appliedPunishments: [],
  selectedPunishment: null,
  recommendations: [],
  activePunishmentsByChild: {},
  historyByChild: {},
  categories: ['general', 'digital', 'physical', 'social', 'educational'],
  filters: {},
  isLoading: false,
  error: null,
  lastSyncAt: null,
  syncStatus: 'idle',
};

// ===== ASYNC THUNKS =====

// Récupérer toutes les punitions
export const fetchPunishmentsAsync = createAsyncThunk<
  Punishment[],
  PunishmentFilters | undefined,
  AsyncThunkConfig
>(
  'punishments/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const punishments = await punishmentsService.getAllPunishments(filters);
      return punishments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch punishments');
    }
  }
);

// Récupérer une punition par ID
export const fetchPunishmentByIdAsync = createAsyncThunk<
  Punishment,
  number,
  AsyncThunkConfig
>(
  'punishments/fetchById',
  async (punishmentId, { rejectWithValue }) => {
    try {
      const punishment = await punishmentsService.getPunishmentById(punishmentId);
      if (!punishment) {
        throw new Error('Punishment not found');
      }
      return punishment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch punishment');
    }
  }
);

// Créer une nouvelle punition
export const createPunishmentAsync = createAsyncThunk<
  Punishment,
  CreatePunishmentRequest,
  AsyncThunkConfig
>(
  'punishments/create',
  async (punishmentData, { rejectWithValue }) => {
    try {
      const newPunishment = await punishmentsService.createPunishment(punishmentData);
      return newPunishment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create punishment');
    }
  }
);

// Mettre à jour une punition
export const updatePunishmentAsync = createAsyncThunk<
  Punishment,
  { id: number; updates: UpdatePunishmentRequest },
  AsyncThunkConfig
>(
  'punishments/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updatedPunishment = await punishmentsService.updatePunishment(id, updates);
      return updatedPunishment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update punishment');
    }
  }
);

// Supprimer une punition
export const deletePunishmentAsync = createAsyncThunk<
  number,
  number,
  AsyncThunkConfig
>(
  'punishments/delete',
  async (punishmentId, { rejectWithValue }) => {
    try {
      const success = await punishmentsService.deletePunishment(punishmentId);
      if (!success) {
        throw new Error('Failed to delete punishment');
      }
      return punishmentId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete punishment');
    }
  }
);

// Appliquer une punition à un enfant
export const applyPunishmentAsync = createAsyncThunk<
  AppliedPunishment,
  { punishmentId: number; childId: number; reason?: string; duration?: number },
  AsyncThunkConfig
>(
  'punishments/apply',
  async ({ punishmentId, childId, reason, duration }, { rejectWithValue, dispatch }) => {
    try {
      const appliedPunishment = await punishmentsService.applyPunishment(
        punishmentId, 
        childId, 
        reason, 
        duration
      );
      
      // Actualiser les punitions actives de l'enfant
      dispatch(fetchActivePunishmentsAsync(childId));
      
      return appliedPunishment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to apply punishment');
    }
  }
);

// Récupérer les punitions actives d'un enfant
export const fetchActivePunishmentsAsync = createAsyncThunk<
  { childId: number; punishments: AppliedPunishment[] },
  number,
  AsyncThunkConfig
>(
  'punishments/fetchActive',
  async (childId, { rejectWithValue }) => {
    try {
      const activePunishments = await punishmentsService.getActivePunishments(childId);
      return { childId, punishments: activePunishments };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch active punishments');
    }
  }
);

// Récupérer l'historique des punitions d'un enfant
export const fetchPunishmentHistoryAsync = createAsyncThunk<
  { childId: number; history: AppliedPunishment[] },
  number,
  AsyncThunkConfig
>(
  'punishments/fetchHistory',
  async (childId, { rejectWithValue }) => {
    try {
      const history = await punishmentsService.getPunishmentHistory(childId);
      return { childId, history };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch punishment history');
    }
  }
);

// Récupérer les recommandations de punitions par âge
export const fetchPunishmentRecommendationsAsync = createAsyncThunk<
  Punishment[],
  AgeGroup,
  AsyncThunkConfig
>(
  'punishments/fetchRecommendations',
  async (ageGroup, { rejectWithValue }) => {
    try {
      const recommendations = await punishmentsService.getPunishmentRecommendationsByAge(ageGroup);
      return recommendations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch punishment recommendations');
    }
  }
);

// Récupérer les recommandations pour un enfant spécifique
export const fetchChildPunishmentRecommendationsAsync = createAsyncThunk<
  Punishment[],
  { childId: number; ageGroup: AgeGroup },
  AsyncThunkConfig
>(
  'punishments/fetchChildRecommendations',
  async ({ childId, ageGroup }, { rejectWithValue }) => {
    try {
      const recommendations = await punishmentsService.getPunishmentRecommendationsForChild(childId, ageGroup);
      return recommendations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch child punishment recommendations');
    }
  }
);

// Désactiver une punition appliquée
export const deactivateAppliedPunishmentAsync = createAsyncThunk<
  { appliedPunishmentId: number; childId: number },
  { appliedPunishmentId: number; childId: number },
  AsyncThunkConfig
>(
  'punishments/deactivateApplied',
  async ({ appliedPunishmentId, childId }, { rejectWithValue, dispatch }) => {
    try {
      const success = await punishmentsService.deactivateAppliedPunishment(appliedPunishmentId);
      if (!success) {
        throw new Error('Failed to deactivate applied punishment');
      }
      
      // Actualiser les punitions actives de l'enfant
      dispatch(fetchActivePunishmentsAsync(childId));
      
      return { appliedPunishmentId, childId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to deactivate applied punishment');
    }
  }
);

// ===== SLICE =====
const punishmentsSlice = createSlice({
  name: 'punishments',
  initialState,
  reducers: {
    // Actions synchrones
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    selectPunishment: (state, action: PayloadAction<Punishment | null>) => {
      state.selectedPunishment = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setFilters: (state, action: PayloadAction<PunishmentFilters>) => {
      state.filters = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // Optimistic update pour l'application d'une punition
    applyPunishmentOptimistic: (state, action: PayloadAction<{
      punishment: Punishment;
      childId: number;
      tempId: string;
    }>) => {
      const { punishment, childId, tempId } = action.payload;
      
      // Créer une punition appliquée temporaire
      const tempAppliedPunishment: AppliedPunishment = {
        '@type': 'AppliedPunishment',
        id: tempId, // ID temporaire
        punishment: `/api/punishments/${punishment.id}`,
        child: `/api/children/${childId}`,
        punishmentName: punishment.name,
        childName: '', // Sera mis à jour par l'API
        reason: 'Application en cours...',
        appliedAt: new Date().toISOString(),
        expiresAt: null,
        isActive: true,
        appliedBy: null,
      };
      
      // Ajouter à la liste des punitions appliquées
      if (!state.activePunishmentsByChild[childId]) {
        state.activePunishmentsByChild[childId] = [];
      }
      state.activePunishmentsByChild[childId].push(tempAppliedPunishment);
    },
    
    // Réinitialiser l'état
    resetPunishmentsState: () => initialState,
  },
  
  extraReducers: (builder) => {
    // ===== FETCH ALL PUNISHMENTS =====
    builder
      .addCase(fetchPunishmentsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.syncStatus = 'pending';
      })
      .addCase(fetchPunishmentsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.punishments = action.payload;
        state.lastSyncAt = Date.now();
        state.syncStatus = 'succeeded';
        state.error = null;
      })
      .addCase(fetchPunishmentsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.syncStatus = 'failed';
      })
      
    // ===== FETCH PUNISHMENT BY ID =====
      .addCase(fetchPunishmentByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPunishmentByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPunishment = action.payload;
        const index = state.punishments.findIndex(p => p.id === updatedPunishment.id);
        if (index !== -1) {
          state.punishments[index] = updatedPunishment;
        } else {
          state.punishments.push(updatedPunishment);
        }
        state.error = null;
      })
      .addCase(fetchPunishmentByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== CREATE PUNISHMENT =====
      .addCase(createPunishmentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPunishmentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.punishments.push(action.payload);
        state.error = null;
      })
      .addCase(createPunishmentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== UPDATE PUNISHMENT =====
      .addCase(updatePunishmentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePunishmentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPunishment = action.payload;
        const index = state.punishments.findIndex(p => p.id === updatedPunishment.id);
        if (index !== -1) {
          state.punishments[index] = updatedPunishment;
        }
        // Mettre à jour selectedPunishment si c'est la même
        if (state.selectedPunishment?.id === updatedPunishment.id) {
          state.selectedPunishment = updatedPunishment;
        }
        state.error = null;
      })
      .addCase(updatePunishmentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== DELETE PUNISHMENT =====
      .addCase(deletePunishmentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePunishmentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedPunishmentId = action.payload;
        state.punishments = state.punishments.filter(p => p.id !== deletedPunishmentId);
        
        // Désélectionner si c'était la punition sélectionnée
        if (state.selectedPunishment?.id === deletedPunishmentId) {
          state.selectedPunishment = null;
        }
        
        state.error = null;
      })
      .addCase(deletePunishmentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== APPLY PUNISHMENT =====
      .addCase(applyPunishmentAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(applyPunishmentAsync.fulfilled, (state, action) => {
        const appliedPunishment = action.payload;
        state.appliedPunishments.push(appliedPunishment);
        state.error = null;
      })
      .addCase(applyPunishmentAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // TODO: Revert optimistic update si nécessaire
      })
      
    // ===== FETCH ACTIVE PUNISHMENTS =====
      .addCase(fetchActivePunishmentsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchActivePunishmentsAsync.fulfilled, (state, action) => {
        const { childId, punishments } = action.payload;
        state.activePunishmentsByChild[childId] = punishments;
        state.error = null;
      })
      .addCase(fetchActivePunishmentsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH PUNISHMENT HISTORY =====
      .addCase(fetchPunishmentHistoryAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPunishmentHistoryAsync.fulfilled, (state, action) => {
        const { childId, history } = action.payload;
        state.historyByChild[childId] = history;
        state.error = null;
      })
      .addCase(fetchPunishmentHistoryAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH RECOMMENDATIONS =====
      .addCase(fetchPunishmentRecommendationsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPunishmentRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchPunishmentRecommendationsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH CHILD RECOMMENDATIONS =====
      .addCase(fetchChildPunishmentRecommendationsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchChildPunishmentRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchChildPunishmentRecommendationsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== DEACTIVATE APPLIED PUNISHMENT =====
      .addCase(deactivateAppliedPunishmentAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(deactivateAppliedPunishmentAsync.fulfilled, (state, action) => {
        const { appliedPunishmentId, childId } = action.payload;
        
        // Retirer de la liste des punitions actives
        if (state.activePunishmentsByChild[childId]) {
          state.activePunishmentsByChild[childId] = state.activePunishmentsByChild[childId]
            .filter(ap => ap.id !== appliedPunishmentId);
        }
        
        state.error = null;
      })
      .addCase(deactivateAppliedPunishmentAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  setLoading,
  selectPunishment,
  clearError,
  setFilters,
  clearFilters,
  applyPunishmentOptimistic,
  resetPunishmentsState,
} = punishmentsSlice.actions;

// Export du reducer
export default punishmentsSlice.reducer;