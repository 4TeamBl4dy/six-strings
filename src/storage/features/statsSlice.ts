import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StatItem, DetailItem } from '../../types/stats';
import { getSalerStats, SalerStatsResponse } from '../../api/stats'; // API function and response type

interface StatsState {
  basketStats: StatItem[];
  favoritesStats: StatItem[];
  basketDetails: DetailItem[];
  favoritesDetails: DetailItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  basketStats: [],
  favoritesStats: [],
  basketDetails: [],
  favoritesDetails: [],
  isLoading: false,
  error: null,
};

// Async Thunk for fetching saler statistics
export const fetchSalerStats = createAsyncThunk<
  SalerStatsResponse, // Return type
  string,             // Argument type: sellerLogin
  { rejectValue: string } // ThunkAPI types
>(
  'stats/fetchSalerStats',
  async (sellerLogin, { rejectWithValue }) => {
    try {
      const response = await getSalerStats(sellerLogin);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    // Action to clear stats data, e.g., on logout or when seller context changes
    clearStats: (state) => {
      state.basketStats = [];
      state.favoritesStats = [];
      state.basketDetails = [];
      state.favoritesDetails = [];
      state.isLoading = false;
      state.error = null;
    },
    // Action to manually set error if needed from component
    setStatsError: (state, action: PayloadAction<string>) => {
        state.error = action.payload;
    },
    clearStatsError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalerStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalerStats.fulfilled, (state, action: PayloadAction<SalerStatsResponse>) => {
        state.isLoading = false;
        state.basketStats = action.payload.basket || [];
        state.favoritesStats = action.payload.favorites || [];
        state.basketDetails = action.payload.basketDetails || [];
        state.favoritesDetails = action.payload.favoritesDetails || [];
        state.error = null;
      })
      .addCase(fetchSalerStats.rejected, (state, action) => {
        state.isLoading = false;
        // Clear data on error, or keep stale? Clearing for now.
        state.basketStats = [];
        state.favoritesStats = [];
        state.basketDetails = [];
        state.favoritesDetails = [];
        state.error = action.payload || 'Failed to fetch saler statistics';
      });
  },
});

export const { clearStats, setStatsError, clearStatsError } = statsSlice.actions;
export default statsSlice.reducer;
