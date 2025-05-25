import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import basketReducer from './basketSlice';
import favoriteReducer from './favoriteSlice';
import sellerProductReducer from './sellerProductSlice';
import statsReducer from './statsSlice';
import paymentReducer from './paymentSlice'; // Import paymentReducer

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    basket: basketReducer,
    favorites: favoriteReducer,
    sellerProducts: sellerProductReducer,
    stats: statsReducer,
    payment: paymentReducer, // Add paymentReducer
  },
  // Optional: Add middleware like thunk, which is included by default with configureStore
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  // Optional: Enable Redux DevTools
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
