import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, UserPreferences } from '../../types';
import { Session } from 'next-auth';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

const defaultPreferences: UserPreferences = {
  categories: ['technology', 'business', 'entertainment'],
  darkMode: false,
  language: 'en',
  feedSettings: {
    newsEnabled: true,
    moviesEnabled: true,
    musicEnabled: true,
    socialEnabled: true,
    itemsPerPage: 20,
  },
};

// Async thunk to sync user from NextAuth session
export const syncUserFromSession = createAsyncThunk(
  'user/syncFromSession',
  async (session: Session | null) => {
    if (session?.user) {
      const user: User = {
        id: (session.user as any).id || session.user.email || '',
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
        preferences: defaultPreferences,
      };
      
      // Try to load preferences from localStorage
      try {
        const savedPrefs = localStorage.getItem(`user-preferences-${user.id}`);
        if (savedPrefs) {
          user.preferences = { ...defaultPreferences, ...JSON.parse(savedPrefs) };
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
      
      return user;
    }
    return null;
  }
);

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  preferences: defaultPreferences,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.preferences = action.payload.preferences;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.preferences = defaultPreferences;
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nextauth.session');
      }
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      if (state.user) {
        state.user.preferences = state.preferences;
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `user-preferences-${state.user.id}`,
            JSON.stringify(state.preferences)
          );
        }
      }
    },
    toggleDarkMode: (state) => {
      state.preferences.darkMode = !state.preferences.darkMode;
      if (state.user) {
        state.user.preferences.darkMode = state.preferences.darkMode;
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `user-preferences-${state.user.id}`,
            JSON.stringify(state.preferences)
          );
        }
      }
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.preferences.categories.includes(action.payload)) {
        state.preferences.categories.push(action.payload);
        if (state.user && typeof window !== 'undefined') {
          localStorage.setItem(
            `user-preferences-${state.user.id}`,
            JSON.stringify(state.preferences)
          );
        }
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.preferences.categories = state.preferences.categories.filter(
        (category) => category !== action.payload
      );
      if (state.user && typeof window !== 'undefined') {
        localStorage.setItem(
          `user-preferences-${state.user.id}`,
          JSON.stringify(state.preferences)
        );
      }
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload;
      if (state.user) {
        state.user.preferences.language = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `user-preferences-${state.user.id}`,
            JSON.stringify(state.preferences)
          );
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncUserFromSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncUserFromSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.preferences = action.payload.preferences;
        } else {
          state.user = null;
          state.isAuthenticated = false;
          state.preferences = defaultPreferences;
        }
      })
      .addCase(syncUserFromSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to sync user';
      });
  },
});

export const {
  setUser,
  clearUser,
  updatePreferences,
  toggleDarkMode,
  addCategory,
  removeCategory,
  setLanguage,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
