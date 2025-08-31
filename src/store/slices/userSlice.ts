import { createSlice } from '@reduxjs/toolkit';
import { UserState } from '../../types/app/store';

const initialState: UserState = {
  profile: null,
  children: [],
  preferences: {
    theme: 'auto',
    language: 'en',
    notifications: true,
    sounds: true,
  },
  isLoading: false,
  error: null,
  lastSyncAt: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Placeholder reducers
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoading } = userSlice.actions;
export default userSlice.reducer;