import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { RootState as AppRootState } from './rootReducer'; // Renamed RootState to avoid conflict

export const store = configureStore({
  reducer: rootReducer,
  // Middleware is automatically included by configureStore, including thunk.
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = AppRootState; // Use the imported and renamed RootState
export type AppDispatch = typeof store.dispatch;
