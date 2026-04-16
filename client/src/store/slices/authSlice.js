import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUser, loginUser, logoutUser, getProfile } from '../../services/endpoints';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const { data } = await registerUser(userData);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const { data } = await loginUser(credentials);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await logoutUser();
    localStorage.removeItem('user');
  } catch (error) {
    localStorage.removeItem('user');
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, thunkAPI) => {
  try {
    const { data } = await getProfile();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    profile: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; })
      .addCase(register.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Login
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Logout
      .addCase(logout.fulfilled, (state) => { state.user = null; state.profile = null; })
      // Profile
      .addCase(fetchProfile.fulfilled, (state, action) => { state.profile = action.payload; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
