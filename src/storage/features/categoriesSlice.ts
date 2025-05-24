import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../../types/categories';
import { getCategories } from '../../api/categories'; // Assumed API function

interface CategoriesState {
  items: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async Thunk for fetching categories
export const fetchCategories = createAsyncThunk<
  Category[], // Return type
  void,       // Argument type (void for no argument)
  { rejectValue: string } // ThunkAPI types
>(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategories(); // Call the (mocked) API function
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch categories');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Can add synchronous reducers here if needed in the future
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.items = []; // Clear items or keep stale data as per preference
        state.error = action.payload || 'Failed to fetch categories';
      });
  },
});

// Export actions (if any synchronous actions are added later)
// export const { } = categoriesSlice.actions;

export default categoriesSlice.reducer;
