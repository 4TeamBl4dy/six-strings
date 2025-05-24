// src/storage/store.ts
import { createStore, applyMiddleware, Store } from 'redux';
import { thunk, ThunkMiddleware } from 'redux-thunk'; // Corrected import for redux-thunk
import { composeWithDevTools } from '@redux-devtools/extension'; // For Redux DevTools Extension

import rootReducer from './reducers'; // Your root reducer
import { RootState, ReduxAction } from 'src/types'; // Your RootState and a generic Action type

// Define the store type explicitly
const store: Store<RootState, ReduxAction> = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(thunk as ThunkMiddleware<RootState, ReduxAction>)
  )
);

export default store;
