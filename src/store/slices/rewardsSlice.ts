import { createSlice } from '@reduxjs/toolkit';
import { RewardsState } from '../../types/app/store';

const initialState: RewardsState = {
  rewards: [],
  claims: [],
  selectedReward: null,
  cart: [],
  categories: [],
  filters: {},
  isLoading: false,
  error: null,
  lastSyncAt: null,
};

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

export const { setLoading } = rewardsSlice.actions;
export default rewardsSlice.reducer;