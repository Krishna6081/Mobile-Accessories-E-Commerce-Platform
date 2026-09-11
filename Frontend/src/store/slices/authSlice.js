import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
