import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getStats, StatsResponse, StatItem, DetailItem } from 'src/api'; // Ensure types are correctly imported or defined here

interface StatsState {
  basketStats: StatItem[];
  favoriteStats: StatItem[];
  basketDetails: DetailItem[];
  favoriteDetails: DetailItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  basketStats: [],
  favoriteStats: [],
  basketDetails: [],
  favoriteDetails: [],
  isLoading: false,
  error: null,
};

export const fetchStatsThunk = createAsyncThunk<StatsResponse, string, { rejectValue: string }>( // string is for sellerLogin
  'stats/fetchStats',
  async (sellerLogin, { rejectWithValue }) => {
    try {
      const response = await getStats(sellerLogin);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch stats');
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: { 
    setLoading(state, action: PayloadAction<boolean>) { // Kept for potential sync control
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) { // Kept for potential sync control
      state.error = action.payload;
    }
   },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStatsThunk.fulfilled, (state, action: PayloadAction<StatsResponse>) => {
        state.isLoading = false;
        state.basketStats = action.payload.basket;
        state.favoriteStats = action.payload.favorites;
        state.basketDetails = action.payload.basketDetails;
        state.favoriteDetails = action.payload.favoriteDetails;
      })
      .addCase(fetchStatsThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch stats';
      });
  },
});

export const { setLoading, setError } = statsSlice.actions; // Exporting existing sync reducers
export default statsSlice.reducer;
