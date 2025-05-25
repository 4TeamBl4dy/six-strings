import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllGuitars } from 'src/api';
import { Guitar } from 'src/types';

interface ProductState {
  items: Guitar[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchAllProducts = createAsyncThunk<Guitar[], void, { rejectValue: string }>(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllGuitars();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch products');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // setProducts, setLoading, setError can be removed if thunks handle all state changes
    // Or kept for synchronous updates if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action: PayloadAction<Guitar[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch products';
      });
  },
});

// export const { setProducts, setLoading, setError } = productSlice.actions; // Remove if not used
export default productSlice.reducer;
