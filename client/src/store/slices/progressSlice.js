import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCourseProgress, updateProgress } from '../../services/endpoints';

export const fetchCourseProgress = createAsyncThunk('progress/fetchCourse', async (courseId, thunkAPI) => {
  try {
    const { data } = await getCourseProgress(courseId);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
  }
});

export const saveProgress = createAsyncThunk('progress/save', async ({ sessionId, progressData }, thunkAPI) => {
  try {
    const { data } = await updateProgress(sessionId, progressData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to save progress');
  }
});

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    courseProgress: null,
    sessionProgress: {},
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProgress: (state) => {
      state.courseProgress = null;
      state.sessionProgress = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseProgress.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courseProgress = action.payload;
      })
      .addCase(fetchCourseProgress.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(saveProgress.fulfilled, (state, action) => {
        state.sessionProgress[action.payload.sessionId] = action.payload;
      });
  },
});

export const { clearProgress } = progressSlice.actions;
export default progressSlice.reducer;
