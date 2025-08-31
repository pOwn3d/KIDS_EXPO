import { createSlice } from '@reduxjs/toolkit';
import { GamificationState } from '../../types/app/store';

const initialState: GamificationState = {
  tournaments: [],
  guilds: [],
  leaderboards: [],
  achievements: [],
  virtualPets: {},
  skillTrees: {},
  dailyWheels: {},
  isLoading: false,
  error: null,
  lastSyncAt: null,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

export const { setLoading } = gamificationSlice.actions;
export default gamificationSlice.reducer;