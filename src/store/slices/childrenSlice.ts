import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChildrenState, AsyncThunkConfig } from '../../types/app/store';
import { Child, CreateChildDto, UpdateChildDto, ChildStatistics, ChildActivity, AgeGroup } from '../../types/api';
import { childrenService } from '../../services/children.service';

// Initial state avec nouveaux champs
const initialState: ChildrenState = {
  children: [],
  selectedChild: null,
  isLoading: false,
  error: null,
  stats: {},
  lastSyncAt: null,
  // Nouveaux champs pour les fonctionnalités avancées
  childStatistics: {},
  childActivities: {},
  ageGroupFilters: [],
  syncStatus: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
};

// ===== ASYNC THUNKS =====

// Récupérer tous les enfants
export const fetchChildrenAsync = createAsyncThunk<
  Child[],
  void,
  AsyncThunkConfig
>(
  'children/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const children = await childrenService.getAllChildren();
      return children;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch children');
    }
  }
);

// Récupérer un enfant par ID
export const fetchChildByIdAsync = createAsyncThunk<
  Child,
  string | number,
  AsyncThunkConfig
>(
  'children/fetchById',
  async (childId, { rejectWithValue }) => {
    try {
      const child = await childrenService.getChildById(childId);
      if (!child) {
        throw new Error('Child not found');
      }
      return child;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch child');
    }
  }
);

// Créer un nouvel enfant
export const createChildAsync = createAsyncThunk<
  Child,
  CreateChildDto,
  AsyncThunkConfig
>(
  'children/create',
  async (childData, { rejectWithValue }) => {
    try {
      const newChild = await childrenService.createChild(childData);
      if (!newChild) {
        throw new Error('Failed to create child');
      }
      return newChild;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create child');
    }
  }
);

// Mettre à jour un enfant
export const updateChildAsync = createAsyncThunk<
  Child,
  { id: string | number; updates: UpdateChildDto },
  AsyncThunkConfig
>(
  'children/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updatedChild = await childrenService.updateChild(id, updates);
      if (!updatedChild) {
        throw new Error('Failed to update child');
      }
      return updatedChild;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update child');
    }
  }
);

// Supprimer un enfant
export const deleteChildAsync = createAsyncThunk<
  string | number,
  string | number,
  AsyncThunkConfig
>(
  'children/delete',
  async (childId, { rejectWithValue }) => {
    try {
      const success = await childrenService.deleteChild(childId);
      if (!success) {
        throw new Error('Failed to delete child');
      }
      return childId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete child');
    }
  }
);

// Récupérer les statistiques d'un enfant
export const fetchChildStatisticsAsync = createAsyncThunk<
  { childId: string | number; statistics: ChildStatistics },
  string | number,
  AsyncThunkConfig
>(
  'children/fetchStatistics',
  async (childId, { rejectWithValue }) => {
    try {
      const statistics = await childrenService.getChildStatistics(childId);
      if (!statistics) {
        throw new Error('No statistics found for child');
      }
      return { childId, statistics };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch child statistics');
    }
  }
);

// Récupérer les activités d'un enfant
export const fetchChildActivitiesAsync = createAsyncThunk<
  { childId: string | number; activities: ChildActivity[] },
  { childId: string | number; limit?: number },
  AsyncThunkConfig
>(
  'children/fetchActivities',
  async ({ childId, limit = 10 }, { rejectWithValue }) => {
    try {
      const activities = await childrenService.getChildActivity(childId, limit);
      return { childId, activities };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch child activities');
    }
  }
);

// Ajouter des points à un enfant
export const addPointsToChildAsync = createAsyncThunk<
  { childId: string | number; points: number },
  { childId: string | number; points: number; reason?: string },
  AsyncThunkConfig
>(
  'children/addPoints',
  async ({ childId, points, reason }, { rejectWithValue, dispatch }) => {
    try {
      const success = await childrenService.addPointsToChild(childId, points, reason);
      if (!success) {
        throw new Error('Failed to add points');
      }
      
      // Actualiser les stats de l'enfant après ajout de points
      dispatch(fetchChildStatisticsAsync(childId));
      
      return { childId, points };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add points to child');
    }
  }
);

// ===== SLICE =====
const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    // Actions synchrones
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    selectChild: (state, action: PayloadAction<Child | null>) => {
      state.selectedChild = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setAgeGroupFilters: (state, action: PayloadAction<AgeGroup[]>) => {
      state.ageGroupFilters = action.payload;
    },
    
    // Mise à jour locale des points (optimistic update)
    updateChildPointsLocally: (state, action: PayloadAction<{ childId: string | number; points: number }>) => {
      const { childId, points } = action.payload;
      const child = state.children.find(c => c.id === childId);
      if (child) {
        child.currentPoints += points;
      }
      
      // Mettre à jour les stats si elles existent
      if (state.childStatistics[childId]) {
        state.childStatistics[childId].totalPoints += points;
      }
    },
    
    // Réinitialiser l'état
    resetChildrenState: () => initialState,
  },
  
  extraReducers: (builder) => {
    // ===== FETCH ALL CHILDREN =====
    builder
      .addCase(fetchChildrenAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.syncStatus = 'pending';
      })
      .addCase(fetchChildrenAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.children = action.payload;
        state.lastSyncAt = Date.now();
        state.syncStatus = 'succeeded';
        state.error = null;
      })
      .addCase(fetchChildrenAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.syncStatus = 'failed';
      })
      
    // ===== FETCH CHILD BY ID =====
      .addCase(fetchChildByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedChild = action.payload;
        const index = state.children.findIndex(c => c.id === updatedChild.id);
        if (index !== -1) {
          state.children[index] = updatedChild;
        } else {
          state.children.push(updatedChild);
        }
        state.error = null;
      })
      .addCase(fetchChildByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== CREATE CHILD =====
      .addCase(createChildAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChildAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.children.push(action.payload);
        state.error = null;
      })
      .addCase(createChildAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== UPDATE CHILD =====
      .addCase(updateChildAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateChildAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedChild = action.payload;
        const index = state.children.findIndex(c => c.id === updatedChild.id);
        if (index !== -1) {
          state.children[index] = updatedChild;
        }
        // Mettre à jour selectedChild si c'est le même
        if (state.selectedChild?.id === updatedChild.id) {
          state.selectedChild = updatedChild;
        }
        state.error = null;
      })
      .addCase(updateChildAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== DELETE CHILD =====
      .addCase(deleteChildAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteChildAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedChildId = action.payload;
        state.children = state.children.filter(c => c.id !== deletedChildId);
        
        // Désélectionner si c'était l'enfant sélectionné
        if (state.selectedChild?.id === deletedChildId) {
          state.selectedChild = null;
        }
        
        // Nettoyer les données associées
        delete state.childStatistics[deletedChildId];
        delete state.childActivities[deletedChildId];
        
        state.error = null;
      })
      .addCase(deleteChildAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // ===== CHILD STATISTICS =====
      .addCase(fetchChildStatisticsAsync.pending, (state) => {
        // Ne pas mettre isLoading à true pour éviter le spinner global
        state.error = null;
      })
      .addCase(fetchChildStatisticsAsync.fulfilled, (state, action) => {
        const { childId, statistics } = action.payload;
        state.childStatistics[childId] = statistics;
        state.error = null;
      })
      .addCase(fetchChildStatisticsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== CHILD ACTIVITIES =====
      .addCase(fetchChildActivitiesAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchChildActivitiesAsync.fulfilled, (state, action) => {
        const { childId, activities } = action.payload;
        state.childActivities[childId] = activities;
        state.error = null;
      })
      .addCase(fetchChildActivitiesAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
    // ===== ADD POINTS =====
      .addCase(addPointsToChildAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(addPointsToChildAsync.fulfilled, (state, action) => {
        // L'optimistic update a déjà été fait dans le reducer synchrone
        state.error = null;
      })
      .addCase(addPointsToChildAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // TODO: Revert optimistic update si nécessaire
      });
  },
});

// Export des actions
export const {
  setLoading,
  selectChild,
  clearError,
  setAgeGroupFilters,
  updateChildPointsLocally,
  resetChildrenState,
} = childrenSlice.actions;

// Export du reducer
export default childrenSlice.reducer;