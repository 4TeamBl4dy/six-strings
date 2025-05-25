import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { BasketItem } from 'src/types';
import { getBasket, addToBasket, updateBasketItemQuantity, removeBasketItem, clearBasket, confirmPurchase } from 'src/api';

interface AddToBasketPayload { guitarId: string; guitarImg: string; guitarName: string; guitarCost: number; guitarAmount: number; }
interface UpdateBasketItemPayload { guitarId: string; action: 'plus' | 'minus'; }

interface BasketState {
  items: BasketItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BasketState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchBasket = createAsyncThunk<BasketItem[], void, { rejectValue: string }>(
  'basket/fetchBasket',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getBasket();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch basket');
    }
  }
);

export const addItemToBasket = createAsyncThunk<BasketItem, AddToBasketPayload, { rejectValue: string }>(
  'basket/addItemToBasket',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await addToBasket(itemData);
      // Assuming API returns the added item or a success confirmation.
      // If API returns the whole basket, change BasketItem to BasketItem[] and update reducer.
      // For now, we assume the API call itself is the source of truth for the added item,
      // and the local state is updated optimistically or based on this.
      // The response from `addToBasket` in `src/api/basket.ts` is `instance.post('/basket', data);`
      // which by default in axios returns the response data from the server.
      // We'll assume the server returns the created/updated BasketItem.
      // If not, this part needs to align with actual API behavior (e.g., refetch basket).
      return response.data; // Assuming API returns the BasketItem
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add item to basket');
    }
  }
);

export const updateBasketItem = createAsyncThunk<BasketItem[], UpdateBasketItemPayload, { rejectValue: string }>(
  'basket/updateBasketItem',
  async ({ guitarId, action }, { rejectWithValue }) => {
    try {
      await updateBasketItemQuantity(guitarId, action);
      const response = await getBasket(); // Refetch basket to get updated state
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update item quantity');
    }
  }
);

export const removeItemFromBasket = createAsyncThunk<string, string, { rejectValue: string }>(
  'basket/removeItemFromBasket',
  async (guitarId, { rejectWithValue }) => {
    try {
      await removeBasketItem(guitarId);
      return guitarId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove item from basket');
    }
  }
);

export const clearUserBasket = createAsyncThunk<void, void, { rejectValue: string }>(
  'basket/clearUserBasket',
  async (_, { rejectWithValue }) => {
    try {
      await clearBasket();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to clear basket');
    }
  }
);

export const confirmUserPurchase = createAsyncThunk<void, void, { rejectValue: string }>(
    'basket/confirmUserPurchase',
    async (_, { rejectWithValue }) => {
        try {
            await confirmPurchase();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to confirm purchase');
        }
    }
);

const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchBasket
      .addCase(fetchBasket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBasket.fulfilled, (state, action: PayloadAction<BasketItem[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchBasket.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch basket';
      })
      // addItemToBasket
      .addCase(addItemToBasket.pending, (state) => {
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(addItemToBasket.fulfilled, (state, action: PayloadAction<BasketItem>) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.guitarId === action.payload.guitarId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addItemToBasket.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to add item';
      })
      // updateBasketItem
      .addCase(updateBasketItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBasketItem.fulfilled, (state, action: PayloadAction<BasketItem[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(updateBasketItem.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update item';
      })
      // removeItemFromBasket
      .addCase(removeItemFromBasket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeItemFromBasket.fulfilled, (state, action: PayloadAction<string>) => { 
        state.isLoading = false;
        state.items = state.items.filter(item => item.guitarId !== action.payload);
      })
      .addCase(removeItemFromBasket.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to remove item';
      })
      // clearUserBasket
      .addCase(clearUserBasket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearUserBasket.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
      })
      .addCase(clearUserBasket.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to clear basket';
      })
      // confirmUserPurchase
      .addCase(confirmUserPurchase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmUserPurchase.fulfilled, (state) => {
        state.isLoading = false;
        state.items = []; 
      })
      .addCase(confirmUserPurchase.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to confirm purchase';
      });
  },
});

export const { setLoading, setError } = basketSlice.actions; 
export default basketSlice.reducer;
