import { createSlice } from '@reduxjs/toolkit';
import { AnalyticsState } from '../../types/app/store';

const initialState: AnalyticsState = {
  dashboard: null,
  reports: [],
  goals: [],
  insights: [],
  isLoading: false,
  error: null,
  lastUpdateAt: null,
  selectedPeriod: 'LAST_30_DAYS',
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setPeriod: (state, action) => { state.selectedPeriod = action.payload; },
  },
});

export const { setLoading, setPeriod } = analyticsSlice.actions;
export default analyticsSlice.reducer;