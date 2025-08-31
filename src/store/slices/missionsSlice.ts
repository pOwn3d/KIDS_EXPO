import { createSlice } from '@reduxjs/toolkit';
import { MissionsState } from '../../types/app/store';

const initialState: MissionsState = {
  missions: [],
  selectedMission: null,
  templates: [],
  categories: [],
  filters: {},
  isLoading: false,
  error: null,
  lastSyncAt: null,
  pendingActions: [],
};

const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

export const { setLoading } = missionsSlice.actions;
export default missionsSlice.reducer;