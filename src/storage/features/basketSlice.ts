import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getBasket,
  updateBasketItemQuantity,
  removeBasketItem,
  clearBasket,
  confirmPurchase,
} from '../../api/basket';
import { BasketItem } from '../../types/basket';

interface BasketState {
  items: BasketItem[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  sum: number;
}

const initialState: BasketState = {
  items: [],
  loading: 'idle',
  error: null,
  sum: 0,
};

const calculateSum = (items: BasketItem[]): number => {
  return items.reduce((total, item) => total + item.guitarCost * item.guitarCount, 0);
};

// Async Thunks
export const fetchBasket = createAsyncThunk('basket/fetchBasket', async () => {
  const response = await getBasket();
  return response; // This is Promise<BasketItem[]>
});

export const updateBasketItem = createAsyncThunk(
  'basket/updateBasketItem',
  async (params: { guitarId: string; action: 'plus' | 'minus' }, { rejectWithValue }) => {
    try {
      // The API returns the updated basket, but createAsyncThunk typically expects the updated item or void.
      // We'll rely on fetchBasket to get the updated state or handle it in extraReducers.
      // For now, let's assume the API call itself is enough and we'll refetch or update manually.
      await updateBasketItemQuantity(params.guitarId, params.action);
      // To update the state correctly, we should return the full updated basket or the changed item.
      // Let's refetch the basket to ensure data consistency.
      const updatedBasket = await getBasket();
      return updatedBasket;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const removeItemFromBasket = createAsyncThunk(
  'basket/removeItemFromBasket',
  async (guitarId: string, { rejectWithValue }) => {
    try {
      await removeBasketItem(guitarId);
      // Refetch the basket to ensure data consistency
      const updatedBasket = await getBasket();
      return updatedBasket;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const clearUserBasket = createAsyncThunk('basket/clearUserBasket', async (_, { rejectWithValue }) => {
  try {
    await clearBasket();
    return []; // Return an empty array to represent the cleared basket
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const confirmUserPurchase = createAsyncThunk('basket/confirmUserPurchase', async (_, { rejectWithValue }) => {
  try {
    await confirmPurchase();
    return []; // Return an empty array as basket is cleared after purchase
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchBasket
      .addCase(fetchBasket.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchBasket.fulfilled, (state, action: PayloadAction<BasketItem[]>) => {
        state.loading = 'succeeded';
        state.items = action.payload;
        state.sum = calculateSum(action.payload);
      })
      .addCase(fetchBasket.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || action.error.message || 'Failed to fetch basket';
      })
      // updateBasketItem
      .addCase(updateBasketItem.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(updateBasketItem.fulfilled, (state, action: PayloadAction<BasketItem[]>) => {
        state.loading = 'succeeded';
        state.items = action.payload;
        state.sum = calculateSum(action.payload);
      })
      .addCase(updateBasketItem.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || action.error.message || 'Failed to update item';
      })
      // removeItemFromBasket
      .addCase(removeItemFromBasket.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(removeItemFromBasket.fulfilled, (state, action: PayloadAction<BasketItem[]>) => {
        state.loading = 'succeeded';
        state.items = action.payload;
        state.sum = calculateSum(action.payload);
      })
      .addCase(removeItemFromBasket.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || action.error.message || 'Failed to remove item';
      })
      // clearUserBasket
      .addCase(clearUserBasket.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(clearUserBasket.fulfilled, (state, action: PayloadAction<BasketItem[]>) => {
        state.loading = 'succeeded';
        state.items = action.payload; // Should be empty
        state.sum = 0;
      })
      .addCase(clearUserBasket.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || action.error.message || 'Failed to clear basket';
      })
      // confirmUserPurchase
      .addCase(confirmUserPurchase.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(confirmUserPurchase.fulfilled, (state, action: PayloadAction<BasketItem[]>) => {
        state.loading = 'succeeded';
        state.items = action.payload; // Should be empty
        state.sum = 0;
        // Potentially add a success message or redirect logic here or in the component
      })
      .addCase(confirmUserPurchase.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || action.error.message || 'Failed to confirm purchase';
      });
  },
});

export default basketSlice.reducer;
