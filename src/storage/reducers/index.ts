// src/storage/reducers/index.ts
import { combineReducers } from 'redux';
import { RootState } from 'src/types'; // Ensure RootState is imported
import { guitarReducer } from './guitarReducer';
import { basketReducer } from './basketReducer';
// Import other reducers here as they are created

// Placeholder for userReducer - will be created later
const userReducerPlaceholder = (state = null, action: any) => state;


export const rootReducer = combineReducers<RootState>({
  guitars: guitarReducer,
  basket: basketReducer,
  user: userReducerPlaceholder as any, // Replace with actual userReducer later
  // Add other reducers here
});

export default rootReducer;
