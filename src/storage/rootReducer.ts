import { combineReducers } from '@reduxjs/toolkit';
import productReducer from './features/productSlice';
import basketReducer from './features/basketSlice';
import authReducer from './features/authSlice';
import userProfileReducer from './features/userProfileSlice';
import favoritesReducer from './features/favoritesSlice';
import categoriesReducer from './features/categoriesSlice';
import salerProductReducer from './features/salerProductSlice';
import statsReducer from './features/statsSlice'; // Import the stats reducer

const rootReducer = combineReducers({
  products: productReducer,
  basket: basketReducer,
  auth: authReducer,
  userProfile: userProfileReducer,
  favorites: favoritesReducer,
  categories: categoriesReducer,
  salerProducts: salerProductReducer,
  stats: statsReducer, // Add stats reducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
