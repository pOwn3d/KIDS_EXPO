import { createSlice } from '@reduxjs/toolkit';
import { ChildrenState } from '../../types/app/store';

const initialState: ChildrenState = {
  children: [],
  selectedChild: null,
  isLoading: false,
  error: null,
  stats: {},
  lastSyncAt: null,
};

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

export const { setLoading } = childrenSlice.actions;
export default childrenSlice.reducer;