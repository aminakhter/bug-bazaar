import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setAuthToken } from '../api/client';
import { User } from '../types/api';
import type { RootState } from './store';

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      setAuthToken(action.payload.token);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      setAuthToken(null);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectCurrentUser = (state: RootState): User | null => state.auth.user;
export const selectIsAuthenticated = (state: RootState): boolean => Boolean(state.auth.token);

export default authSlice.reducer;