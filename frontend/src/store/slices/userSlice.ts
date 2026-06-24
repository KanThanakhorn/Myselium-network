import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '../../types';

const initialState: AuthState = {
  currentUser: {
    id: 'usr-1',
    email: 'admin@mycelium.org',
    role: 'admin',
    name: 'Somchai Jaidee (Admin)'
  }, // Logged in by default in development mode
  token: 'mock-jwt-token-xyz-123',
  isAuthenticated: true,
  loading: false,
  error: null,
};

// Mock Login thunk
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Direct mock logic
      if (email === 'admin@mycelium.org' && password === 'password') {
        return {
          user: { id: 'usr-1', email, role: 'admin' as const, name: 'Somchai Jaidee (Admin)' },
          token: 'mock-jwt-token-admin'
        };
      } else if (email === 'ranger@mycelium.org' && password === 'password') {
        return {
          user: { id: 'usr-2', email, role: 'ranger' as const, name: 'Ranger Kittisak' },
          token: 'mock-jwt-token-ranger'
        };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = userSlice.actions;

export default userSlice.reducer;
