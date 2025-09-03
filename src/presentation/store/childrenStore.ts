/**
 * Children Store - Zustand implementation
 * Manages children state with optimistic updates
 */

import { create } from 'zustand';
import { ChildEntity } from '../../core/entities/Child';

interface ChildrenState {
  // State
  children: ChildEntity[];
  selectedChildId: number | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed
  selectedChild: ChildEntity | null;
  
  // Actions
  setChildren: (children: ChildEntity[]) => void;
  addChild: (child: ChildEntity) => void;
  updateChild: (id: number, updates: Partial<ChildEntity>) => void;
  removeChild: (id: number) => void;
  selectChild: (id: number | null) => void;
  
  // Points management with optimistic updates
  addPoints: (childId: number, points: number) => void;
  deductPoints: (childId: number, points: number) => void;
  
  // Loading and error management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utilities
  getChildById: (id: number) => ChildEntity | undefined;
  reset: () => void;
}

const initialState = {
  children: [],
  selectedChildId: null,
  selectedChild: null,
  isLoading: false,
  error: null,
};

export const useChildrenStore = create<ChildrenState>((set, get) => ({
  ...initialState,
  
  // Set all children
  setChildren: (children) => {
    set({ 
      children,
      selectedChild: children.find(c => c.id === get().selectedChildId) || null 
    });
  },
  
  // Add a new child
  addChild: (child) => {
    set((state) => ({
      children: [...state.children, child],
    }));
  },
  
  // Update a child
  updateChild: (id, updates) => {
    set((state) => ({
      children: state.children.map(child =>
        child.id === id ? { ...child, ...updates } : child
      ),
      selectedChild: state.selectedChildId === id
        ? { ...state.selectedChild!, ...updates }
        : state.selectedChild,
    }));
  },
  
  // Remove a child
  removeChild: (id) => {
    set((state) => ({
      children: state.children.filter(child => child.id !== id),
      selectedChildId: state.selectedChildId === id ? null : state.selectedChildId,
      selectedChild: state.selectedChildId === id ? null : state.selectedChild,
    }));
  },
  
  // Select a child
  selectChild: (id) => {
    const child = id ? get().children.find(c => c.id === id) : null;
    set({
      selectedChildId: id,
      selectedChild: child || null,
    });
  },
  
  // Add points (optimistic update)
  addPoints: (childId, points) => {
    set((state) => {
      const children = state.children.map(child => {
        if (child.id === childId) {
          const updated = { ...child };
          updated.points += points;
          // Update level if needed (1 level per 100 points)
          updated.level = Math.floor(updated.points / 100) + 1;
          return updated;
        }
        return child;
      });
      
      const selectedChild = state.selectedChildId === childId
        ? children.find(c => c.id === childId) || null
        : state.selectedChild;
        
      return { children, selectedChild };
    });
  },
  
  // Deduct points (optimistic update)
  deductPoints: (childId, points) => {
    set((state) => {
      const children = state.children.map(child => {
        if (child.id === childId) {
          const updated = { ...child };
          updated.points = Math.max(0, updated.points - points);
          // Update level if needed
          updated.level = Math.floor(updated.points / 100) + 1;
          return updated;
        }
        return child;
      });
      
      const selectedChild = state.selectedChildId === childId
        ? children.find(c => c.id === childId) || null
        : state.selectedChild;
        
      return { children, selectedChild };
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
  
  // Get child by ID
  getChildById: (id) => {
    return get().children.find(child => child.id === id);
  },
  
  // Reset store
  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const selectChildren = (state: ChildrenState) => state.children;
export const selectSelectedChild = (state: ChildrenState) => state.selectedChild;
export const selectChildrenLoading = (state: ChildrenState) => state.isLoading;
export const selectChildrenError = (state: ChildrenState) => state.error;
export const selectChildById = (id: number) => (state: ChildrenState) => 
  state.children.find(child => child.id === id);