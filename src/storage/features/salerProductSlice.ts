import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Guitar } from '../../types/product';
import { 
    getMyProducts, 
    createMyProduct, 
    updateMyProduct, 
    deleteMyProduct 
} from '../../api/myProducts';

// Define a type for the arguments of updateSalerProduct thunk
interface UpdateSalerProductArgs {
  productId: string;
  productData: FormData;
}

interface SalerProductState {
  products: Guitar[];
  isLoading: boolean; // For fetching the list
  error: string | null;    // For errors during list fetch
  isProcessing: boolean; // For CUD operations (create, update, delete)
  processingError: string | null; // For errors during CUD operations
}

const initialState: SalerProductState = {
  products: [],
  isLoading: false,
  error: null,
  isProcessing: false,
  processingError: null,
};

// Async Thunks

// Fetches products for a specific seller
export const fetchSalerProducts = createAsyncThunk<
  Guitar[], // Return type
  string,   // Argument type: sellerLogin
  { rejectValue: string } // ThunkAPI types
>(
  'salerProducts/fetchSalerProducts',
  async (sellerLogin, { rejectWithValue }) => {
    try {
      const response = await getMyProducts(sellerLogin);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Creates a new product for the current seller
export const createSalerProduct = createAsyncThunk<
  Guitar,    // Return type: the created Guitar
  FormData,  // Argument type: productData (FormData)
  { rejectValue: string }
>(
  'salerProducts/createSalerProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await createMyProduct(productData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Updates an existing product for the current seller
export const updateSalerProduct = createAsyncThunk<
  Guitar,                   // Return type: the updated Guitar
  UpdateSalerProductArgs,   // Argument type
  { rejectValue: string }
>(
  'salerProducts/updateSalerProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await updateMyProduct(productId, productData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Deletes a product for the current seller
export const deleteSalerProduct = createAsyncThunk<
  string,             // Return type: productId (to identify which item was removed)
  string,             // Argument type: productId
  { rejectValue: string }
>(
  'salerProducts/deleteSalerProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await deleteMyProduct(productId);
      return productId; // Return the ID to remove it from state
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const salerProductSlice = createSlice({
  name: 'salerProducts',
  initialState,
  reducers: {
    // Action to manually set processing error if needed
    setSalerProductProcessingError: (state, action: PayloadAction<string>) => {
        state.processingError = action.payload;
    },
    clearSalerProductProcessingError: (state) => {
        state.processingError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Saler Products
      .addCase(fetchSalerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalerProducts.fulfilled, (state, action: PayloadAction<Guitar[]>) => {
        state.isLoading = false;
        state.products = action.payload;
        state.error = null;
      })
      .addCase(fetchSalerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.products = [];
        state.error = action.payload || 'Failed to fetch saler products';
      })
      // Create Saler Product
      .addCase(createSalerProduct.pending, (state) => {
        state.isProcessing = true;
        state.processingError = null;
      })
      .addCase(createSalerProduct.fulfilled, (state, action: PayloadAction<Guitar>) => {
        state.isProcessing = false;
        state.products.push(action.payload); // Add the new product to the list
        state.processingError = null;
      })
      .addCase(createSalerProduct.rejected, (state, action) => {
        state.isProcessing = false;
        state.processingError = action.payload || 'Failed to create product';
      })
      // Update Saler Product
      .addCase(updateSalerProduct.pending, (state) => {
        state.isProcessing = true;
        state.processingError = null;
      })
      .addCase(updateSalerProduct.fulfilled, (state, action: PayloadAction<Guitar>) => {
        state.isProcessing = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload; // Update the product in the list
        }
        state.processingError = null;
      })
      .addCase(updateSalerProduct.rejected, (state, action) => {
        state.isProcessing = false;
        state.processingError = action.payload || 'Failed to update product';
      })
      // Delete Saler Product
      .addCase(deleteSalerProduct.pending, (state) => {
        state.isProcessing = true;
        state.processingError = null;
      })
      .addCase(deleteSalerProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.isProcessing = false;
        state.products = state.products.filter(p => p._id !== action.payload); // Remove product by ID
        state.processingError = null;
      })
      .addCase(deleteSalerProduct.rejected, (state, action) => {
        state.isProcessing = false;
        state.processingError = action.payload || 'Failed to delete product';
      });
  },
});

export const { 
    setSalerProductProcessingError, 
    clearSalerProductProcessingError 
} = salerProductSlice.actions;

export default salerProductSlice.reducer;
