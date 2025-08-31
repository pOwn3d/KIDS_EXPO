import { createSlice } from '@reduxjs/toolkit';
import { SparkyState } from '../../types/app/store';

const initialState: SparkyState = {
  conversations: [],
  activeConversation: null,
  recommendations: [],
  isTyping: false,
  isLoading: false,
  error: null,
  settings: {
    isEnabled: true,
    communicationStyle: 'casual',
    maxDailyInteractions: 20,
    allowMissionSuggestions: true,
    allowRewardSuggestions: true,
    parentalControls: {
      allowMissionSuggestions: true,
      allowRewardSuggestions: true,
      maxDailyInteractions: 20,
      blockedTopics: [],
      requireParentApproval: false,
    },
    language: 'en',
    voiceEnabled: false,
  },
};

const sparkySlice = createSlice({
  name: 'sparky',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setTyping: (state, action) => { state.isTyping = action.payload; },
  },
});

export const { setLoading, setTyping } = sparkySlice.actions;
export default sparkySlice.reducer;