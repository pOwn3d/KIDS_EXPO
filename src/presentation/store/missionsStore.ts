/**
 * Missions Store - Zustand implementation
 * Manages missions state with filtering and sorting
 */

import { create } from 'zustand';
import { MissionEntity, MissionStatus, MissionCategory } from '../../core/entities/Mission';

interface MissionFilters {
  status?: MissionStatus;
  category?: MissionCategory;
  childId?: number;
  showOverdue?: boolean;
}

interface MissionsState {
  // State
  missions: MissionEntity[];
  filters: MissionFilters;
  isLoading: boolean;
  error: string | null;
  
  // Computed
  filteredMissions: MissionEntity[];
  pendingValidations: MissionEntity[];
  
  // Actions
  setMissions: (missions: MissionEntity[]) => void;
  addMission: (mission: MissionEntity) => void;
  updateMission: (id: number, updates: Partial<MissionEntity>) => void;
  removeMission: (id: number) => void;
  
  // Filter actions
  setFilters: (filters: MissionFilters) => void;
  clearFilters: () => void;
  
  // Mission status updates (optimistic)
  completeMission: (id: number) => void;
  validateMission: (id: number) => void;
  rejectMission: (id: number) => void;
  
  // Loading and error management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utilities
  getMissionById: (id: number) => MissionEntity | undefined;
  getMissionsByChildId: (childId: number) => MissionEntity[];
  getStatistics: () => {
    total: number;
    pending: number;
    completed: number;
    validated: number;
  };
  reset: () => void;
}

const initialState = {
  missions: [],
  filters: {},
  filteredMissions: [],
  pendingValidations: [],
  isLoading: false,
  error: null,
};

export const useMissionsStore = create<MissionsState>((set, get) => ({
  ...initialState,
  
  // Set all missions
  setMissions: (missions) => {
    const filtered = applyFilters(missions, get().filters);
    const pendingValidations = missions.filter(m => m.status === 'COMPLETED');
    set({ 
      missions,
      filteredMissions: filtered,
      pendingValidations,
    });
  },
  
  // Add a new mission
  addMission: (mission) => {
    set((state) => {
      const missions = [...state.missions, mission];
      const filtered = applyFilters(missions, state.filters);
      const pendingValidations = missions.filter(m => m.status === 'COMPLETED');
      return { 
        missions,
        filteredMissions: filtered,
        pendingValidations,
      };
    });
  },
  
  // Update a mission
  updateMission: (id, updates) => {
    set((state) => {
      const missions = state.missions.map(mission =>
        mission.id === id ? { ...mission, ...updates } : mission
      );
      const filtered = applyFilters(missions, state.filters);
      const pendingValidations = missions.filter(m => m.status === 'COMPLETED');
      return { 
        missions,
        filteredMissions: filtered,
        pendingValidations,
      };
    });
  },
  
  // Remove a mission
  removeMission: (id) => {
    set((state) => {
      const missions = state.missions.filter(mission => mission.id !== id);
      const filtered = applyFilters(missions, state.filters);
      const pendingValidations = missions.filter(m => m.status === 'COMPLETED');
      return { 
        missions,
        filteredMissions: filtered,
        pendingValidations,
      };
    });
  },
  
  // Set filters
  setFilters: (filters) => {
    set((state) => {
      const filtered = applyFilters(state.missions, filters);
      return { filters, filteredMissions: filtered };
    });
  },
  
  // Clear filters
  clearFilters: () => {
    set((state) => ({
      filters: {},
      filteredMissions: state.missions,
    }));
  },
  
  // Complete mission (optimistic)
  completeMission: (id) => {
    get().updateMission(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
    });
  },
  
  // Validate mission (optimistic)
  validateMission: (id) => {
    get().updateMission(id, {
      status: 'VALIDATED',
      validatedAt: new Date(),
    });
  },
  
  // Reject mission (optimistic)
  rejectMission: (id) => {
    get().updateMission(id, {
      status: 'REJECTED',
    });
  },
  
  // Loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  // Error management
  setError: (error) => {
    set({ error, isLoading: false });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Get mission by ID
  getMissionById: (id) => {
    return get().missions.find(mission => mission.id === id);
  },
  
  // Get missions by child ID
  getMissionsByChildId: (childId) => {
    return get().missions.filter(mission => mission.childId === childId);
  },
  
  // Get statistics
  getStatistics: () => {
    const missions = get().missions;
    return {
      total: missions.length,
      pending: missions.filter(m => m.status === 'PENDING').length,
      completed: missions.filter(m => m.status === 'COMPLETED').length,
      validated: missions.filter(m => m.status === 'VALIDATED').length,
    };
  },
  
  // Reset store
  reset: () => {
    set(initialState);
  },
}));

// Helper function to apply filters
function applyFilters(missions: MissionEntity[], filters: MissionFilters): MissionEntity[] {
  let filtered = [...missions];
  
  if (filters.status) {
    filtered = filtered.filter(m => m.status === filters.status);
  }
  
  if (filters.category) {
    filtered = filtered.filter(m => m.category === filters.category);
  }
  
  if (filters.childId) {
    filtered = filtered.filter(m => m.childId === filters.childId);
  }
  
  if (filters.showOverdue) {
    filtered = filtered.filter(m => m.isOverdue);
  }
  
  return filtered;
}

// Selectors
export const selectMissions = (state: MissionsState) => state.filteredMissions;
export const selectAllMissions = (state: MissionsState) => state.missions;
export const selectPendingValidations = (state: MissionsState) => state.pendingValidations;
export const selectMissionsLoading = (state: MissionsState) => state.isLoading;
export const selectMissionsError = (state: MissionsState) => state.error;
export const selectMissionFilters = (state: MissionsState) => state.filters;