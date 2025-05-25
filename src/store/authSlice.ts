import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Saler } from 'src/types';
import {
  loginUser as loginUserApi,
  loginSaler as loginSalerApi,
  registerUser as registerUserApi,
  registerSaler as registerSalerApi,
  getUserProfile,
  updateUserProfile,
  getSalerProfile,
  updateSalerProfile
} from 'src/api';

interface AuthResponse {
  token: string;
  name: string;
  phone: string;
  login: string;
  img?: string;
}

const transformAuthResponseToUser = (data: AuthResponse): User | Saler => ({
  login: data.login,
  name: data.name,
  phone: data.phone,
  img: data.img || undefined,
});

interface AuthState {
  user: User | Saler | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isSalerAccount: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
  isSalerAccount: localStorage.getItem('isSaler') === 'true',
};

export const loginUserThunk = createAsyncThunk<AuthResponse, any, { rejectValue: string }>(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
        const response = await loginUserApi(credentials);
        return response.data;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
        }
    }
);

export const loginSalerThunk = createAsyncThunk<AuthResponse, any, { rejectValue: string }>(
    'auth/loginSaler',
    async (credentials, { rejectWithValue }) => {
        try {
        const response = await loginSalerApi(credentials);
        return response.data;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
        }
    }
);

export const registerUserThunk = createAsyncThunk<AuthResponse, any, { rejectValue: string }>(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
        const response = await registerUserApi(userData);
        return response.data;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
        }
    }
);

export const registerSalerThunk = createAsyncThunk<AuthResponse, any, { rejectValue: string }>(
    'auth/registerSaler',
    async (userData, { rejectWithValue }) => {
        try {
        const response = await registerSalerApi(userData);
        return response.data;
        } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
        }
    }
);

export const fetchAuthenticatedUserThunk = createAsyncThunk<User | Saler, void, { rejectValue: string, state: { auth: AuthState } }>(
    'auth/fetchAuthenticatedUser',
    async (_, { rejectWithValue, getState }) => {
        const { isSalerAccount } = getState().auth; 
        try {
            if (isSalerAccount) {
                const response = await getSalerProfile();
                return response.data;
            } else {
                const response = await getUserProfile();
                return response.data;
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
        }
    }
);


export const updateUserThunk = createAsyncThunk<User, FormData, { rejectValue: string }>(
    'auth/updateUser',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await updateUserProfile(formData);
            if (response.headers.authorization) {
                localStorage.setItem('access_token', response.headers.authorization.split(' ')[1]);
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user profile');
        }
    }
);

export const updateSalerThunk = createAsyncThunk<Saler, FormData, { rejectValue: string }>(
    'auth/updateSaler',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await updateSalerProfile(formData);
            if (response.headers.authorization) {
                localStorage.setItem('access_token', response.headers.authorization.split(' ')[1]);
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update saler profile');
        }
    }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ token: string; user: User | Saler; isSaler: boolean }>) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isSalerAccount = action.payload.isSaler;
      state.error = null; 
      localStorage.setItem('access_token', action.payload.token);
      localStorage.setItem('isSaler', String(action.payload.isSaler));
      localStorage.setItem('login', action.payload.user.login);
      if (action.payload.user.name) localStorage.setItem('userName', action.payload.user.name); else localStorage.removeItem('userName');
      if (action.payload.user.phone) localStorage.setItem('userPhone', action.payload.user.phone); else localStorage.removeItem('userPhone');
      if (action.payload.user.img) localStorage.setItem('userImg', action.payload.user.img); else localStorage.removeItem('userImg');
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('access_token');
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.isSalerAccount = false; 
      localStorage.removeItem('access_token');
      localStorage.removeItem('isSaler');
      localStorage.removeItem('login');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userImg');
    },
    setUser(state, action: PayloadAction<{ user: User | Saler | null, isSaler?: boolean }>) {
       state.user = action.payload.user;
       state.isLoading = false;
       state.isAuthenticated = !!action.payload.user;
       if (action.payload.isSaler !== undefined) {
           state.isSalerAccount = action.payload.isSaler;
       }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUserThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUserThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = transformAuthResponseToUser(action.payload); 
        state.isSalerAccount = false;
        state.error = null;
        localStorage.setItem('access_token', action.payload.token);
        localStorage.setItem('isSaler', 'false');
        localStorage.setItem('login', action.payload.login);
        if (action.payload.name) localStorage.setItem('userName', action.payload.name); else localStorage.removeItem('userName');
        if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone); else localStorage.removeItem('userPhone');
        if (action.payload.img) localStorage.setItem('userImg', action.payload.img); else localStorage.removeItem('userImg');
      })
      .addCase(loginUserThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false; state.error = action.payload || 'Login failed'; state.isAuthenticated = false; state.user = null; state.token = null; state.isSalerAccount = false;
        localStorage.removeItem('access_token'); localStorage.removeItem('isSaler'); localStorage.removeItem('login'); localStorage.removeItem('userName'); localStorage.removeItem('userPhone'); localStorage.removeItem('userImg');
      })
      // Login Saler
      .addCase(loginSalerThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginSalerThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = transformAuthResponseToUser(action.payload); 
        state.isSalerAccount = true;
        state.error = null;
        localStorage.setItem('access_token', action.payload.token);
        localStorage.setItem('isSaler', 'true');
        localStorage.setItem('login', action.payload.login);
        if (action.payload.name) localStorage.setItem('userName', action.payload.name); else localStorage.removeItem('userName');
        if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone); else localStorage.removeItem('userPhone');
        if (action.payload.img) localStorage.setItem('userImg', action.payload.img); else localStorage.removeItem('userImg');
      })
      .addCase(loginSalerThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false; state.error = action.payload || 'Login failed'; state.isAuthenticated = false; state.user = null; state.token = null; state.isSalerAccount = false;
        localStorage.removeItem('access_token'); localStorage.removeItem('isSaler'); localStorage.removeItem('login'); localStorage.removeItem('userName'); localStorage.removeItem('userPhone'); localStorage.removeItem('userImg');
      })
      // Register User
      .addCase(registerUserThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUserThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = transformAuthResponseToUser(action.payload);
        state.isSalerAccount = false;
        state.error = null;
        localStorage.setItem('access_token', action.payload.token);
        localStorage.setItem('isSaler', 'false');
        localStorage.setItem('login', action.payload.login);
        if (action.payload.name) localStorage.setItem('userName', action.payload.name); else localStorage.removeItem('userName');
        if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone); else localStorage.removeItem('userPhone');
        if (action.payload.img) localStorage.setItem('userImg', action.payload.img); else localStorage.removeItem('userImg');
      })
      .addCase(registerUserThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false; state.error = action.payload || 'Registration failed'; state.isAuthenticated = false; state.user = null; state.token = null; state.isSalerAccount = false;
        localStorage.removeItem('access_token'); localStorage.removeItem('isSaler'); localStorage.removeItem('login'); localStorage.removeItem('userName'); localStorage.removeItem('userPhone'); localStorage.removeItem('userImg');
      })
      // Register Saler
      .addCase(registerSalerThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerSalerThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = transformAuthResponseToUser(action.payload);
        state.isSalerAccount = true;
        state.error = null;
        localStorage.setItem('access_token', action.payload.token);
        localStorage.setItem('isSaler', 'true');
        localStorage.setItem('login', action.payload.login);
        if (action.payload.name) localStorage.setItem('userName', action.payload.name); else localStorage.removeItem('userName');
        if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone); else localStorage.removeItem('userPhone');
        if (action.payload.img) localStorage.setItem('userImg', action.payload.img); else localStorage.removeItem('userImg');
      })
      .addCase(registerSalerThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false; state.error = action.payload || 'Registration failed'; state.isAuthenticated = false; state.user = null; state.token = null; state.isSalerAccount = false;
        localStorage.removeItem('access_token'); localStorage.removeItem('isSaler'); localStorage.removeItem('login'); localStorage.removeItem('userName'); localStorage.removeItem('userPhone'); localStorage.removeItem('userImg');
      })
      // fetchAuthenticatedUserThunk
      .addCase(fetchAuthenticatedUserThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAuthenticatedUserThunk.fulfilled, (state, action: PayloadAction<User | Saler>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload;
          state.token = localStorage.getItem('access_token'); // Ensure token is loaded from LS
          // isSalerAccount should be correctly set from initialState or login/register
          localStorage.setItem('login', action.payload.login);
          if (action.payload.name) localStorage.setItem('userName', action.payload.name); else localStorage.removeItem('userName');
          if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone); else localStorage.removeItem('userPhone');
          if (action.payload.img) localStorage.setItem('userImg', action.payload.img); else localStorage.removeItem('userImg');
      })
      .addCase(fetchAuthenticatedUserThunk.rejected, (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false; state.error = action.payload || 'Failed to fetch user'; state.isAuthenticated = false; state.user = null; state.token = null; state.isSalerAccount = false;
          localStorage.removeItem('access_token'); localStorage.removeItem('isSaler'); localStorage.removeItem('login'); localStorage.removeItem('userName'); localStorage.removeItem('userPhone'); localStorage.removeItem('userImg');
      })
      // Update User Profile
      .addCase(updateUserThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(updateUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.token = localStorage.getItem('access_token'); // Token might have been refreshed by API
          localStorage.setItem('login', action.payload.login); // Update localStorage
          if (action.payload.name) localStorage.setItem('userName', action.payload.name); else localStorage.removeItem('userName');
          if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone); else localStorage.removeItem('userPhone');
          if (action.payload.img) localStorage.setItem('userImg', action.payload.img); else localStorage.removeItem('userImg');
      })
      .addCase(updateUserThunk.rejected, (state, action: PayloadAction<string | undefined>) => { state.isLoading = false; state.error = action.payload || 'Update failed'; })
      // Update Saler Profile
      .addCase(updateSalerThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(updateSalerThunk.fulfilled, (state, action: PayloadAction<Saler>) => {
          state.isLoading = false;
          state.user = action.payload; 
          state.token = localStorage.getItem('access_token');
          localStorage.setItem('login', action.payload.login);
          if (action.payload.name) localStorage.setItem('userName', action.payload.name); else localStorage.removeItem('userName');
          if (action.payload.phone) localStorage.setItem('userPhone', action.payload.phone); else localStorage.removeItem('userPhone');
          if (action.payload.img) localStorage.setItem('userImg', action.payload.img); else localStorage.removeItem('userImg');
      })
      .addCase(updateSalerThunk.rejected, (state, action: PayloadAction<string | undefined>) => { state.isLoading = false; state.error = action.payload || 'Update failed'; });
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
