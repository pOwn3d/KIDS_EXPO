import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AsyncThunkConfig, MissionsState } from '../../types/app/store';
import { 
  Mission, 
  CreateMissionRequest, 
  UpdateMissionRequest,
  MissionCategory,
  MissionDifficulty,
  MissionStatus
} from '../../types/api/missions';
import { AgeGroup } from '../../types/api/children';
import { missionsService } from '../../services/missions.service';

// Enhanced initial state
const initialState: MissionsState = {
  missions: [],
  selectedMission: null,
  templates: [],
  categories: ['education', 'chores', 'health', 'creativity', 'social', 'sports', 'reading'],
  filters: {},
  isLoading: false,
  error: null,
  lastSyncAt: null,
  pendingActions: [],
  // Nouveaux champs pour les fonctionnalités avancées
  recommendations: [],
  missionsByChild: {},
  completedMissions: [],
  activeMissions: [],
  syncStatus: 'idle',
};

// ===== ASYNC THUNKS =====

// Récupérer toutes les missions
export const fetchMissionsAsync = createAsyncThunk<
  Mission[],
  { childId?: number; status?: MissionStatus } | undefined,
  AsyncThunkConfig
>(
  'missions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const missions = await missionsService.getAllMissions(params);
      return missions;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch missions');
    }
  }
);

// Récupérer les missions d'un enfant
export const fetchChildMissionsAsync = createAsyncThunk<
  { childId: number; missions: Mission[] },
  { childId: number; status?: MissionStatus },
  AsyncThunkConfig
>(
  'missions/fetchChildMissions',
  async ({ childId, status }, { rejectWithValue }) => {
    try {
      const missions = await missionsService.getChildMissions(childId, status);
      return { childId, missions };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch child missions');
    }
  }
);

// Récupérer une mission par ID
export const fetchMissionByIdAsync = createAsyncThunk<
  Mission,
  number,
  AsyncThunkConfig
>(
  'missions/fetchById',
  async (missionId, { rejectWithValue }) => {
    try {
      const mission = await missionsService.getMissionById(missionId);
      if (!mission) {
        throw new Error('Mission not found');
      }
      return mission;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch mission');
    }
  }
);

// Créer une nouvelle mission
export const createMissionAsync = createAsyncThunk<
  Mission,
  CreateMissionRequest,
  AsyncThunkConfig
>(
  'missions/create',
  async (missionData, { rejectWithValue }) => {
    try {
      const newMission = await missionsService.createMission(missionData);
      return newMission;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create mission');
    }
  }
);

// Mettre à jour une mission
export const updateMissionAsync = createAsyncThunk<
  Mission,
  { id: number; updates: UpdateMissionRequest },
  AsyncThunkConfig
>(
  'missions/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updatedMission = await missionsService.updateMission(id, updates);
      return updatedMission;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update mission');
    }
  }
);

// Supprimer une mission
export const deleteMissionAsync = createAsyncThunk<
  number,
  number,
  AsyncThunkConfig
>(
  'missions/delete',
  async (missionId, { rejectWithValue }) => {
    try {
      const success = await missionsService.deleteMission(missionId);
      if (!success) {
        throw new Error('Failed to delete mission');
      }
      return missionId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete mission');
    }
  }
);

// Compléter une mission
export const completeMissionAsync = createAsyncThunk<
  Mission,
  { missionId: number; childId: number; evidence?: string },
  AsyncThunkConfig
>(
  'missions/complete',
  async ({ missionId, childId, evidence }, { rejectWithValue, dispatch }) => {
    try {
      const completedMission = await missionsService.completeMission(missionId, childId, evidence);
      
      // Actualiser les missions de l'enfant
      dispatch(fetchChildMissionsAsync({ childId }));
      
      return completedMission;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete mission');
    }
  }
);

// Valider une mission terminée (parent)
export const validateMissionAsync = createAsyncThunk<
  Mission,
  { missionId: number; childId: number; approved: boolean; feedback?: string },
  AsyncThunkConfig
>(
  'missions/validate',
  async ({ missionId, childId, approved, feedback }, { rejectWithValue, dispatch }) => {
    try {
      const validatedMission = await missionsService.validateMission(
        missionId, 
        childId, 
        approved, 
        feedback
      );
      
      // Actualiser les missions de l'enfant
      dispatch(fetchChildMissionsAsync({ childId }));
      
      return validatedMission;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to validate mission');
    }
  }
);

// Récupérer les recommandations de missions par âge
export const fetchMissionRecommendationsAsync = createAsyncThunk<
  Mission[],
  AgeGroup,
  AsyncThunkConfig
>(
  'missions/fetchRecommendations',
  async (ageGroup, { rejectWithValue }) => {
    try {
      const recommendations = await missionsService.getMissionRecommendationsByAge(ageGroup);
      return recommendations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch mission recommendations');
    }
  }
);

// Récupérer les recommandations pour un enfant spécifique
export const fetchChildMissionRecommendationsAsync = createAsyncThunk<
  Mission[],
  { childId: number; ageGroup: AgeGroup },
  AsyncThunkConfig
>(
  'missions/fetchChildRecommendations',
  async ({ childId, ageGroup }, { rejectWithValue }) => {
    try {
      const recommendations = await missionsService.getMissionRecommendationsForChild(childId, ageGroup);
      return recommendations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch child mission recommendations');
    }
  }
);

// Assigner une mission à un enfant
export const assignMissionAsync = createAsyncThunk<
  Mission,
  { missionId: number; childId: number; dueDate?: string },
  AsyncThunkConfig
>(
  'missions/assign',
  async ({ missionId, childId, dueDate }, { rejectWithValue, dispatch }) => {
    try {
      const assignedMission = await missionsService.assignMissionToChild(missionId, childId, dueDate);
      
      // Actualiser les missions de l'enfant
      dispatch(fetchChildMissionsAsync({ childId }));
      
      return assignedMission;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign mission');
    }
  }
);

// ===== SLICE =====
const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    // Actions synchrones
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    selectMission: (state, action: PayloadAction<Mission | null>) => {
      state.selectedMission = action.payload;
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
    
    // Mettre à jour la liste des missions
    setMissions: (state, action: PayloadAction<Mission[]>) => {
      state.missions = action.payload;
      state.lastSyncAt = Date.now();
      
      // Séparer les missions actives et terminées
      state.activeMissions = action.payload.filter(m => 
        m.status === 'pending' || m.status === 'in_progress' || m.status === 'active'
      );
      state.completedMissions = action.payload.filter(m => 
        m.status === 'completed' || m.status === 'validated'
      );
    },
    
    // Optimistic update pour la completion d'une mission
    completeMissionOptimistic: (state, action: PayloadAction<{
      missionId: number;
      childId: number;
    }>) => {
      const { missionId } = action.payload;
      const mission = state.missions.find(m => m.id === missionId);
      if (mission) {
        mission.status = 'completed';
        mission.completedAt = new Date().toISOString();
      }
    },
    
    // Réinitialiser l'état
    resetMissionsState: () => initialState,
  },
  
  extraReducers: (builder) => {
    // ===== FETCH ALL MISSIONS =====
    builder
      .addCase(fetchMissionsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.syncStatus = 'pending';
      })
      .addCase(fetchMissionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.missions = action.payload;
        state.lastSyncAt = Date.now();
        state.syncStatus = 'succeeded';
        
        // Séparer les missions actives et terminées
        state.activeMissions = action.payload.filter(m => 
          m.status === 'pending' || m.status === 'in_progress'
        );
        state.completedMissions = action.payload.filter(m => 
          m.status === 'completed' || m.status === 'validated'
        );
        
        state.error = null;
      })
      .addCase(fetchMissionsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.syncStatus = 'failed';
      })
      
    // ===== FETCH CHILD MISSIONS =====
      .addCase(fetchChildMissionsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchChildMissionsAsync.fulfilled, (state, action) => {
        const { childId, missions } = action.payload;
        state.missionsByChild[childId] = missions;
        state.error = null;
      })
      .addCase(fetchChildMissionsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH MISSION BY ID =====
      .addCase(fetchMissionByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMissionByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedMission = action.payload;
        const index = state.missions.findIndex(m => m.id === updatedMission.id);
        if (index !== -1) {
          state.missions[index] = updatedMission;
        } else {
          state.missions.push(updatedMission);
        }
        state.error = null;
      })
      .addCase(fetchMissionByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== CREATE MISSION =====
      .addCase(createMissionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMissionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.missions.push(action.payload);
        state.error = null;
      })
      .addCase(createMissionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== UPDATE MISSION =====
      .addCase(updateMissionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMissionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedMission = action.payload;
        const index = state.missions.findIndex(m => m.id === updatedMission.id);
        if (index !== -1) {
          state.missions[index] = updatedMission;
        }
        if (state.selectedMission?.id === updatedMission.id) {
          state.selectedMission = updatedMission;
        }
        state.error = null;
      })
      .addCase(updateMissionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== DELETE MISSION =====
      .addCase(deleteMissionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMissionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedMissionId = action.payload;
        state.missions = state.missions.filter(m => m.id !== deletedMissionId);
        
        if (state.selectedMission?.id === deletedMissionId) {
          state.selectedMission = null;
        }
        
        // Nettoyer des autres listes
        state.activeMissions = state.activeMissions.filter(m => m.id !== deletedMissionId);
        state.completedMissions = state.completedMissions.filter(m => m.id !== deletedMissionId);
        
        state.error = null;
      })
      .addCase(deleteMissionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== COMPLETE MISSION =====
      .addCase(completeMissionAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(completeMissionAsync.fulfilled, (state, action) => {
        const completedMission = action.payload;
        const index = state.missions.findIndex(m => m.id === completedMission.id);
        if (index !== -1) {
          state.missions[index] = completedMission;
        }
        
        // Déplacer vers les missions terminées
        state.activeMissions = state.activeMissions.filter(m => m.id !== completedMission.id);
        if (!state.completedMissions.find(m => m.id === completedMission.id)) {
          state.completedMissions.push(completedMission);
        }
        
        state.error = null;
      })
      .addCase(completeMissionAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // TODO: Revert optimistic update
      })
      
    // ===== VALIDATE MISSION =====
      .addCase(validateMissionAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(validateMissionAsync.fulfilled, (state, action) => {
        const validatedMission = action.payload;
        const index = state.missions.findIndex(m => m.id === validatedMission.id);
        if (index !== -1) {
          state.missions[index] = validatedMission;
        }
        
        const completedIndex = state.completedMissions.findIndex(m => m.id === validatedMission.id);
        if (completedIndex !== -1) {
          state.completedMissions[completedIndex] = validatedMission;
        }
        
        state.error = null;
      })
      .addCase(validateMissionAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH RECOMMENDATIONS =====
      .addCase(fetchMissionRecommendationsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMissionRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchMissionRecommendationsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== FETCH CHILD RECOMMENDATIONS =====
      .addCase(fetchChildMissionRecommendationsAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchChildMissionRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendations = action.payload;
        state.error = null;
      })
      .addCase(fetchChildMissionRecommendationsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== ASSIGN MISSION =====
      .addCase(assignMissionAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(assignMissionAsync.fulfilled, (state, action) => {
        const assignedMission = action.payload;
        const index = state.missions.findIndex(m => m.id === assignedMission.id);
        if (index !== -1) {
          state.missions[index] = assignedMission;
        }
        
        // Ajouter aux missions actives si pas déjà présente
        if (!state.activeMissions.find(m => m.id === assignedMission.id)) {
          state.activeMissions.push(assignedMission);
        }
        
        state.error = null;
      })
      .addCase(assignMissionAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export des actions
export const {
  setLoading,
  selectMission,
  clearError,
  setFilters,
  clearFilters,
  setMissions,
  completeMissionOptimistic,
  resetMissionsState,
} = missionsSlice.actions;

// Export du reducer
export default missionsSlice.reducer;