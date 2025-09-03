import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AsyncThunkConfig } from '../../types/app/store';
import { User, LoginRequest, LoginResponse } from '../../types/api';
import { authService } from '../../services/auth.service';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  user: null,
  isLoading: false, // Ensure this starts as false
  error: null,
  sessionExpiry: null,
  lastActivity: Date.now(),
  pinProtected: false,
  pinValidUntil: null,
  // Nouveaux champs pour les invitations
  invitationToken: null,
  invitationValid: false,
  invitationData: null,
};

// Async thunks
export const loginAsync = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  AsyncThunkConfig
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const loginChildAsync = createAsyncThunk<
  LoginResponse,
  { parentEmail: string; childId: string; pin: string },
  AsyncThunkConfig
>(
  'auth/loginChild',
  async ({ parentEmail, childId, pin }, { rejectWithValue }) => {
    try {
      const response = await authService.loginChild(parentEmail, childId, pin);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Child login failed');
    }
  }
);

export const registerAsync = createAsyncThunk<
  LoginResponse,
  {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
  },
  AsyncThunkConfig
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutAsync = createAsyncThunk<
  void,
  void,
  AsyncThunkConfig
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      // Don't reject on logout errors, just log them
    }
  }
);

export const refreshTokenAsync = createAsyncThunk<
  LoginResponse,
  string,
  AsyncThunkConfig
>(
  'auth/refreshToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken(refreshToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk<
  User,
  void,
  AsyncThunkConfig
>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get current user');
    }
  }
);

export const validateSessionAsync = createAsyncThunk<
  User | null,
  void,
  AsyncThunkConfig
>(
  'auth/validateSession',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.validateSession();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Session validation failed');
    }
  }
);

export const verifyParentPinAsync = createAsyncThunk<
  { valid: boolean; validUntil: string },
  string,
  AsyncThunkConfig
>(
  'auth/verifyParentPin',
  async (pin, { rejectWithValue }) => {
    try {
      const response = await authService.verifyParentPin(pin);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'PIN verification failed');
    }
  }
);

export const forgotPasswordAsync = createAsyncThunk<
  { message: string },
  string,
  AsyncThunkConfig
>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset request failed');
    }
  }
);

export const changePasswordAsync = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string },
  AsyncThunkConfig
>(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password change failed');
    }
  }
);

// ===== INVITATION SYSTEM =====

// Valider un token d'invitation
export const validateInvitationTokenAsync = createAsyncThunk<
  { valid: boolean; familyName?: string; parentName?: string },
  string,
  AsyncThunkConfig
>(
  'auth/validateInvitationToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.validateInvitationToken(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Invalid invitation token');
    }
  }
);

// S'inscrire avec un token d'invitation
export const registerWithInvitationAsync = createAsyncThunk<
  LoginResponse,
  {
    invitationToken: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
  },
  AsyncThunkConfig
>(
  'auth/registerWithInvitation',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.registerWithInvitation(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration with invitation failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    
    clearPinValidation: (state) => {
      state.pinProtected = false;
      state.pinValidUntil = null;
    },
    
    setSessionExpiry: (state, action: PayloadAction<number>) => {
      state.sessionExpiry = action.payload;
    },
    
    // For handling token updates from interceptors
    updateTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    
    // For offline/background session restoration
    restoreSession: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.pinProtected = false;
      state.pinValidUntil = null;
      state.error = null;
      state.lastActivity = null;
      state.sessionExpiry = null;
      state.isLoading = false;
    },
    
    // Clear loading state
    clearLoading: (state) => {
      state.isLoading = false;
    },
    
    // ===== INVITATION ACTIONS =====
    setInvitationToken: (state, action: PayloadAction<string | null>) => {
      state.invitationToken = action.payload;
      if (!action.payload) {
        state.invitationValid = false;
        state.invitationData = null;
      }
    },
    
    clearInvitation: (state) => {
      state.invitationToken = null;
      state.invitationValid = false;
      state.invitationData = null;
    },
    
    // Update user profile
    updateUser: (state, action: PayloadAction<User>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || action.payload.data?.user;
        state.token = action.payload.token || action.payload.data?.token;
        state.refreshToken = action.payload.refreshToken || action.payload.token || action.payload.data?.token;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Child Login
    builder
      .addCase(loginChildAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginChildAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(loginChildAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        // Reset to initial state
        return { ...initialState, lastActivity: Date.now() };
      })
      .addCase(logoutAsync.rejected, (state) => {
        // Even if logout fails on server, clear local state
        return { ...initialState, lastActivity: Date.now() };
      });

    // Refresh Token
    builder
      .addCase(refreshTokenAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Validate Session
    builder
      .addCase(validateSessionAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.error = null;
        } else {
          // Session is invalid, reset auth state
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.refreshToken = null;
        }
      })
      .addCase(validateSessionAsync.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      });

    // Verify Parent PIN
    builder
      .addCase(verifyParentPinAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyParentPinAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pinProtected = !action.payload.valid;
        if (action.payload.valid) {
          state.pinValidUntil = new Date(action.payload.validUntil).getTime();
        }
        state.error = null;
      })
      .addCase(verifyParentPinAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.pinProtected = true;
        state.pinValidUntil = null;
        state.error = action.payload as string;
      });

    // Forgot Password
    builder
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change Password
    builder
      .addCase(changePasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ===== INVITATION SYSTEM =====
    
    // Validate Invitation Token
    builder
      .addCase(validateInvitationTokenAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateInvitationTokenAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitationValid = action.payload.valid;
        if (action.payload.valid) {
          state.invitationData = {
            familyName: action.payload.familyName,
            parentName: action.payload.parentName,
          };
        } else {
          state.invitationData = null;
        }
        state.error = null;
      })
      .addCase(validateInvitationTokenAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.invitationValid = false;
        state.invitationData = null;
        state.error = action.payload as string;
      });

    // Register with Invitation
    builder
      .addCase(registerWithInvitationAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerWithInvitationAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        // Clear invitation data after successful registration
        state.invitationToken = null;
        state.invitationValid = false;
        state.invitationData = null;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(registerWithInvitationAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  updateLastActivity,
  clearPinValidation,
  setSessionExpiry,
  updateTokens,
  restoreSession,
  logout,
  clearLoading,
  setInvitationToken,
  clearInvitation,
  updateUser,
} = authSlice.actions;

// Re-export async thunks
export { 
  loginAsync as login,
  logoutAsync as logout, 
  registerAsync as register,
  refreshTokenAsync as refreshToken,
  getCurrentUserAsync as getCurrentUser,
  validateSessionAsync as validateSession,
  verifyParentPinAsync as verifyParentPin,
  forgotPasswordAsync as forgotPassword,
  changePasswordAsync as changePassword,
  validateInvitationTokenAsync as validateInvitationToken,
  registerWithInvitationAsync as registerWithInvitation
};

// Alias for backward compatibility
export const setTokens = updateTokens;

// Selectors
export const selectCurrentUser = (state: any) => state.auth.user;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: any) => state.auth.isLoading;
export const selectAuthError = (state: any) => state.auth.error;
export const selectAuthToken = (state: any) => state.auth.token;

export default authSlice.reducer;