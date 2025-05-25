import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { FavoriteItem } from 'src/types'; // Guitar type is not directly used in this slice's state or thunk payloads
import { getFavorites, addFavorite, removeFavoriteItem, clearFavorites } from 'src/api';

interface AddToFavoritePayload { guitarId: string; guitarImg: string; guitarName: string; guitarCost: number; guitarAmount: number; }

interface FavoriteState {
  items: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoriteState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchFavoritesThunk = createAsyncThunk<FavoriteItem[], void, { rejectValue: string }>(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFavorites();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch favorites');
    }
  }
);

export const addItemToFavoritesThunk = createAsyncThunk<FavoriteItem, AddToFavoritePayload, { rejectValue: string }>(
  'favorites/addItemToFavorites',
  async (itemData, { rejectWithValue }) => {
    try {
      // Assuming the addFavorite API call returns the added item or we can construct it.
      // The API function `addFavorite` expects data of AddToFavoritePayload type.
      // The thunk should return the actual FavoriteItem as it would exist in the state.
      // If addFavorite API returns the created item, use response.data.
      // For now, we'll assume itemData can be cast or is compatible with FavoriteItem structure.
      await addFavorite(itemData); 
      return itemData as FavoriteItem; // This assumes itemData matches FavoriteItem structure.
                                      // If API returns the created item, use response.data.
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add item to favorites');
    }
  }
);

export const removeItemFromFavoritesThunk = createAsyncThunk<string, string, { rejectValue: string }>( // Returns guitarId
  'favorites/removeItemFromFavorites',
  async (guitarId, { rejectWithValue }) => {
    try {
      await removeFavoriteItem(guitarId);
      return guitarId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove item from favorites');
    }
  }
);

export const clearUserFavoritesThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'favorites/clearUserFavorites',
  async (_, { rejectWithValue }) => {
    try {
      await clearFavorites();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to clear favorites');
    }
  }
);

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // setLoading and setError can be kept if synchronous control is needed
    // Or removed if all state changes are handled by thunks.
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchFavoritesThunk
      .addCase(fetchFavoritesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoritesThunk.fulfilled, (state, action: PayloadAction<FavoriteItem[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavoritesThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch favorites';
      })
      // addItemToFavoritesThunk
      .addCase(addItemToFavoritesThunk.pending, (state) => {
        state.isLoading = true; 
      })
      .addCase(addItemToFavoritesThunk.fulfilled, (state, action: PayloadAction<FavoriteItem>) => {
        state.isLoading = false;
        if (!state.items.find(item => item.guitarId === action.payload.guitarId)) {
            state.items.push(action.payload);
        }
      })
      .addCase(addItemToFavoritesThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to add to favorites';
      })
      // removeItemFromFavoritesThunk
      .addCase(removeItemFromFavoritesThunk.pending, (state) => {
        state.isLoading = true; 
      })
      .addCase(removeItemFromFavoritesThunk.fulfilled, (state, action: PayloadAction<string>) => { // guitarId
        state.isLoading = false;
        state.items = state.items.filter(item => item.guitarId !== action.payload);
      })
      .addCase(removeItemFromFavoritesThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to remove from favorites';
      })
      // clearUserFavoritesThunk
      .addCase(clearUserFavoritesThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearUserFavoritesThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
      })
      .addCase(clearUserFavoritesThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to clear favorites';
      });
  },
});

export const { setLoading, setError } = favoriteSlice.actions; // Export synchronous actions if kept
export default favoriteSlice.reducer;
