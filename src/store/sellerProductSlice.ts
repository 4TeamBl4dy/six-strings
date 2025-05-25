import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Guitar } from 'src/types';
import { getSellerGuitars, createGuitar, updateGuitar, deleteGuitar } from 'src/api';

interface SellerProductState {
  items: Guitar[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SellerProductState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchSellerProducts = createAsyncThunk<Guitar[], string, { rejectValue: string }>(
  'sellerProducts/fetchBySeller',
  async (sellerLogin: string, { rejectWithValue }) => {
    try {
      const response = await getSellerGuitars(sellerLogin);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch seller products');
    }
  }
);

export const createSellerProduct = createAsyncThunk<Guitar, FormData, { rejectValue: string }>(
    'sellerProducts/create',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const response = await createGuitar(formData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create product');
        }
    }
);

export const updateExistingSellerProduct = createAsyncThunk<Guitar, { guitarId: string, formData: FormData }, { rejectValue: string }>(
    'sellerProducts/update',
    async ({ guitarId, formData }, { rejectWithValue }) => {
        try {
            const response = await updateGuitar(guitarId, formData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update product');
        }
    }
);

export const deleteExistingSellerProduct = createAsyncThunk<string, string, { rejectValue: string }>( // Renamed to avoid conflict with imported deleteGuitar
    'sellerProducts/delete',
    async (guitarId: string, { rejectWithValue }) => {
        try {
            await deleteGuitar(guitarId);
            return guitarId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete product');
        }
    }
);

const sellerProductSlice = createSlice({
  name: 'sellerProducts',
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
      .addCase(fetchSellerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action: PayloadAction<Guitar[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSellerProducts.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch seller products';
      })
      .addCase(createSellerProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSellerProduct.fulfilled, (state, action: PayloadAction<Guitar>) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createSellerProduct.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create product';
      })
      .addCase(updateExistingSellerProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingSellerProduct.fulfilled, (state, action: PayloadAction<Guitar>) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
            state.items[index] = action.payload;
        }
      })
      .addCase(updateExistingSellerProduct.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update product';
      })
      .addCase(deleteExistingSellerProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExistingSellerProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteExistingSellerProduct.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete product';
      });
  },
});

export const { setLoading, setError } = sellerProductSlice.actions;
export default sellerProductSlice.reducer;
