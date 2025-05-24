import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/user';
import { SalerPublicProfile } from '../../types/saler'; // For Saler specific profile
import { getUserProfile, updateUserProfile } from '../../api/user';
import { getSalerProfile, updateSalerProfile } from '../../api/saler'; // Saler API functions
import { updateAuthUserDetails, AuthUserUpdatePayload } from './authSlice'; // Import action from authSlice

interface UserProfileState {
  profile: UserProfile | SalerPublicProfile | null;
  isLoading: boolean; 
  error: string | null;    
  isUpdating: boolean; 
  updateError: string | null; 
}

const initialState: UserProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  isUpdating: false,
  updateError: null,
};

// Async Thunks for Regular User Profile
export const fetchUserProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>(
  'userProfile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateUserProfileData = createAsyncThunk<
  UserProfile,
  FormData,
  { dispatch: AppDispatch; rejectValue: string } // Added AppDispatch to ThunkAPI
>(
  'userProfile/updateUserProfileData',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await updateUserProfile(formData);
      // Dispatch action to update authSlice user details and localStorage
      const authUpdatePayload: AuthUserUpdatePayload = {
        name: response.name,
        phone: response.phone,
        login: response.login,
        img: response.img,
      };
      dispatch(updateAuthUserDetails(authUpdatePayload));
      // localStorage updates are now handled by updateAuthUserDetails reducer
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async Thunks for Saler Profile
export const fetchCurrentSalerProfile = createAsyncThunk<
  SalerPublicProfile,
  void,
  { rejectValue: string }
>(
  'userProfile/fetchCurrentSalerProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSalerProfile();
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateCurrentSalerProfileData = createAsyncThunk<
  SalerPublicProfile,
  FormData,
  { dispatch: AppDispatch; rejectValue: string } // Added AppDispatch to ThunkAPI
>(
  'userProfile/updateCurrentSalerProfileData',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await updateSalerProfile(formData);
      // Dispatch action to update authSlice user details and localStorage
      const authUpdatePayload: AuthUserUpdatePayload = {
        name: response.name,
        phone: response.phone,
        login: response.login,
        img: response.img,
      };
      dispatch(updateAuthUserDetails(authUpdatePayload));
      // localStorage updates are now handled by updateAuthUserDetails reducer
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);


const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.error = null;
      state.isUpdating = false;
      state.updateError = null;
    },
    setUpdateError: (state, action: PayloadAction<string>) => {
        state.updateError = action.payload;
    },
    clearUpdateError: (state) => {
        state.updateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile (Regular User)
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || 'Failed to fetch user profile';
      })
      // Update User Profile (Regular User)
      .addCase(updateUserProfileData.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateUserProfileData.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isUpdating = false;
        state.profile = action.payload;
        state.updateError = null;
      })
      .addCase(updateUserProfileData.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload || 'Failed to update user profile';
      })
      // Fetch Saler Profile
      .addCase(fetchCurrentSalerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSalerProfile.fulfilled, (state, action: PayloadAction<SalerPublicProfile>) => {
        state.isLoading = false;
        state.profile = action.payload; 
        state.error = null;
      })
      .addCase(fetchCurrentSalerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || 'Failed to fetch saler profile';
      })
      // Update Saler Profile
      .addCase(updateCurrentSalerProfileData.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateCurrentSalerProfileData.fulfilled, (state, action: PayloadAction<SalerPublicProfile>) => {
        state.isUpdating = false;
        state.profile = action.payload; 
        state.updateError = null;
      })
      .addCase(updateCurrentSalerProfileData.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload || 'Failed to update saler profile';
      });
  },
});

// Need to define AppDispatch for thunk typings, or import from store if store.ts doesn't import from slices
// This creates a circular dependency if store imports slices and slices import AppDispatch from store.
// A common pattern is to define AppDispatch in store.ts and thunks use ThunkAction type.
// For now, assuming AppDispatch is available or this would be:
// { dispatch: Dispatch; rejectValue: string }
type AppDispatch = typeof import('../../storage/store').store.dispatch;


export const { clearUserProfile, setUpdateError, clearUpdateError } = userProfileSlice.actions;
export default userProfileSlice.reducer;
