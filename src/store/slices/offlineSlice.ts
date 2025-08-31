import { createSlice } from '@reduxjs/toolkit';
import { OfflineState } from '../../types/app/store';

const initialState: OfflineState = {
  isOffline: false,
  pendingActions: [],
  syncQueue: [],
  lastSyncAt: null,
  conflictResolution: [],
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOfflineStatus: (state, action) => { 
      state.isOffline = action.payload; 
    },
    addPendingAction: (state, action) => {
      state.pendingActions.push(action.payload);
    },
    removePendingAction: (state, action) => {
      state.pendingActions = state.pendingActions.filter(a => a.id !== action.payload);
    },
    clearPendingActions: (state) => {
      state.pendingActions = [];
    },
    addToSyncQueue: (state, action) => {
      state.syncQueue.push(action.payload);
    },
    removeFromSyncQueue: (state, action) => {
      state.syncQueue = state.syncQueue.filter(item => item.id !== action.payload);
    },
    updateLastSync: (state) => {
      state.lastSyncAt = Date.now();
    },
  },
});

export const { 
  setOfflineStatus, 
  addPendingAction,
  removePendingAction,
  clearPendingActions,
  addToSyncQueue,
  removeFromSyncQueue,
  updateLastSync 
} = offlineSlice.actions;
export default offlineSlice.reducer;