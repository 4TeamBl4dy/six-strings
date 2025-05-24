// src/storage/reducers/guitarReducer.ts
import { Guitar, ReduxAction, RootState } from 'src/types';
import * as actionTypes from '../actionTypes';

// Define the shape of the guitar state
export interface GuitarState {
  items: Guitar[];
  loading: boolean;
  error: string | null;
}

const initialState: GuitarState = {
  items: [],
  loading: false,
  error: null,
};

export const guitarReducer = (state = initialState, action: ReduxAction): GuitarState => {
  switch (action.type) {
    case actionTypes.GET_GUITARS_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case actionTypes.GET_GUITARS_SUCCESS:
      return {
        ...state,
        items: action.payload as Guitar[],
        loading: false,
      };
    case actionTypes.GET_GUITARS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload as string,
      };
    default:
      return state;
  }
};
