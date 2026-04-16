import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../../services/endpoints';

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, thunkAPI) => {
  try {
    const { data } = await getCourses(params);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
  }
});

export const fetchCourse = createAsyncThunk('courses/fetchOne', async (id, thunkAPI) => {
  try {
    const { data } = await getCourse(id);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
  }
});

export const addCourse = createAsyncThunk('courses/create', async (courseData, thunkAPI) => {
  try {
    const { data } = await createCourse(courseData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create course');
  }
});

export const editCourse = createAsyncThunk('courses/update', async ({ id, courseData }, thunkAPI) => {
  try {
    const { data } = await updateCourse(id, courseData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update course');
  }
});

export const removeCourse = createAsyncThunk('courses/delete', async (id, thunkAPI) => {
  try {
    await deleteCourse(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete course');
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    currentCourse: null,
    totalPages: 1,
    currentPage: 1,
    total: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchCourses.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.courses;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchCourses.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Fetch one
      .addCase(fetchCourse.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCourse.fulfilled, (state, action) => { state.isLoading = false; state.currentCourse = action.payload; })
      .addCase(fetchCourse.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      // Create
      .addCase(addCourse.fulfilled, (state, action) => { state.courses.unshift(action.payload); })
      // Update
      .addCase(editCourse.fulfilled, (state, action) => {
        const idx = state.courses.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.courses[idx] = action.payload;
        if (state.currentCourse?._id === action.payload._id) state.currentCourse = action.payload;
      })
      // Delete
      .addCase(removeCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
