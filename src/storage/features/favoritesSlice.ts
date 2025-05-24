import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FavoriteProduct } from '../../types/favorites';
import { 
    getFavorites, 
    addFavorite, // Presumed to exist and return FavoriteProduct
    removeFavoriteItem, // API function name is removeFavoriteItem
    clearAllFavorites 
} from '../../api/favorites';

interface FavoritesState {
  items: FavoriteProduct[];
  isLoading: boolean; // For fetching the list of favorites
  error: string | null;    // For errors during fetch
  isUpdating: boolean; // For add/remove operations
  updateError: string | null; // For errors during add/remove
}

const initialState: FavoritesState = {
  items: [],
  isLoading: false,
  error: null,
  isUpdating: false,
  updateError: null,
};

// Async Thunks

// Fetches all favorites for the user
export const fetchFavoritesList = createAsyncThunk<
  FavoriteProduct[], // Return type
  void,              // Argument type
  { rejectValue: string } // ThunkAPI types
>(
  'favorites/fetchFavoritesList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFavorites();
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Adds an item to favorites
export const addFavoriteItem = createAsyncThunk<
  FavoriteProduct,    // Return type (assuming API returns the added favorite)
  string,             // Argument type: productId
  { rejectValue: string }
>(
  'favorites/addFavoriteItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await addFavorite(productId); // Assumes addFavorite API exists and takes productId
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Removes an item from favorites by its product ID
export const removeFavoriteItemById = createAsyncThunk<
  string,             // Return type: productId (to identify which item was removed)
  string,             // Argument type: productId
  { rejectValue: string }
>(
  'favorites/removeFavoriteItemById',
  async (productId, { rejectWithValue }) => {
    try {
      await removeFavoriteItem(productId); // API function is removeFavoriteItem
      return productId; // Return the ID to remove it from state
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Clears all favorites for the user
export const clearAllUserFavorites = createAsyncThunk<
  void,               // Return type (void if API confirms success without data)
  void,               // Argument type
  { rejectValue: string }
>(
  'favorites/clearAllUserFavorites',
  async (_, { rejectWithValue }) => {
    try {
      await clearAllFavorites();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Action to manually set update error if needed from component
    setFavoritesUpdateError: (state, action: PayloadAction<string>) => {
        state.updateError = action.payload;
    },
    clearFavoritesUpdateError: (state) => {
        state.updateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites List
      .addCase(fetchFavoritesList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoritesList.fulfilled, (state, action: PayloadAction<FavoriteProduct[]>) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchFavoritesList.rejected, (state, action) => {
        state.isLoading = false;
        state.items = []; // Clear items on error or keep stale data? Clearing for now.
        state.error = action.payload || 'Failed to fetch favorites';
      })
      // Add Favorite Item
      .addCase(addFavoriteItem.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(addFavoriteItem.fulfilled, (state, action: PayloadAction<FavoriteProduct>) => {
        state.isUpdating = false;
        // Add to list only if not already present (though API might handle this)
        if (!state.items.find(item => item.guitarId === action.payload.guitarId)) {
            state.items.push(action.payload);
        }
        state.updateError = null;
      })
      .addCase(addFavoriteItem.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload || 'Failed to add item to favorites';
      })
      // Remove Favorite Item by ID
      .addCase(removeFavoriteItemById.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(removeFavoriteItemById.fulfilled, (state, action: PayloadAction<string>) => {
        state.isUpdating = false;
        state.items = state.items.filter(item => item.guitarId !== action.payload);
        state.updateError = null;
      })
      .addCase(removeFavoriteItemById.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload || 'Failed to remove item from favorites';
      })
      // Clear All User Favorites
      .addCase(clearAllUserFavorites.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(clearAllUserFavorites.fulfilled, (state) => {
        state.isUpdating = false;
        state.items = [];
        state.updateError = null;
      })
      .addCase(clearAllUserFavorites.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload || 'Failed to clear favorites';
      });
  },
});

export const { setFavoritesUpdateError, clearFavoritesUpdateError } = favoritesSlice.actions;
export default favoritesSlice.reducer;
