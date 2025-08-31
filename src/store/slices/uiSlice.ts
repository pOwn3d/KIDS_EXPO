import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, ModalState, NotificationState } from '../../types/app/store';
import { getPlatformInfo } from '../../utils/platform';

// Initial state
const initialState: UIState = {
  theme: 'auto',
  platform: getPlatformInfo(),
  navigation: {
    activeRoute: '',
    history: [],
    params: {},
    canGoBack: false,
  },
  modals: [],
  notifications: [],
  isOnline: true,
  lastNetworkCheck: Date.now(),
  loadingStates: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },

    // Platform actions
    updatePlatformInfo: (state, action: PayloadAction<typeof initialState.platform>) => {
      state.platform = action.payload;
    },

    // Navigation actions
    setActiveRoute: (state, action: PayloadAction<string>) => {
      state.navigation.activeRoute = action.payload;
      if (!state.navigation.history.includes(action.payload)) {
        state.navigation.history.push(action.payload);
      }
    },

    setNavigationParams: (state, action: PayloadAction<Record<string, any>>) => {
      state.navigation.params = action.payload;
    },

    setCanGoBack: (state, action: PayloadAction<boolean>) => {
      state.navigation.canGoBack = action.payload;
    },

    clearNavigationHistory: (state) => {
      state.navigation.history = [];
    },

    // Modal actions
    showModal: (state, action: PayloadAction<Omit<ModalState, 'isVisible'>>) => {
      const existingIndex = state.modals.findIndex(modal => modal.id === action.payload.id);
      if (existingIndex >= 0) {
        state.modals[existingIndex] = { ...action.payload, isVisible: true };
      } else {
        state.modals.push({ ...action.payload, isVisible: true });
      }
    },

    hideModal: (state, action: PayloadAction<string>) => {
      const index = state.modals.findIndex(modal => modal.id === action.payload);
      if (index >= 0) {
        state.modals[index].isVisible = false;
      }
    },

    removeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },

    clearModals: (state) => {
      state.modals = [];
    },

    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<NotificationState, 'id' | 'timestamp' | 'isRead'>>) => {
      const notification: NotificationState = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        isRead: false,
        ...action.payload,
      };
      state.notifications.unshift(notification); // Add to beginning
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },

    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Network status actions
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      state.lastNetworkCheck = Date.now();
    },

    updateLastNetworkCheck: (state) => {
      state.lastNetworkCheck = Date.now();
    },

    // Loading states actions
    setLoadingState: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      const { key, isLoading } = action.payload;
      if (isLoading) {
        state.loadingStates[key] = true;
      } else {
        delete state.loadingStates[key];
      }
    },

    clearLoadingStates: (state) => {
      state.loadingStates = {};
    },
  },
});

export const {
  // Theme
  setTheme,
  
  // Platform
  updatePlatformInfo,
  
  // Navigation
  setActiveRoute,
  setNavigationParams,
  setCanGoBack,
  clearNavigationHistory,
  
  // Modals
  showModal,
  hideModal,
  removeModal,
  clearModals,
  
  // Notifications
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  
  // Network
  setOnlineStatus,
  updateLastNetworkCheck,
  
  // Loading
  setLoadingState,
  clearLoadingStates,
} = uiSlice.actions;

export default uiSlice.reducer;