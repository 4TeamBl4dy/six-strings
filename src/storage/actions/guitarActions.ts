// src/storage/actions/guitarActions.ts
import { Guitar, ReduxAction, RootState } from 'src/types';
import * as actionTypes from '../actionTypes';
import { fetchGuitarsAPI } from 'src/api';
import { ThunkAction } from 'redux-thunk'; // Import ThunkAction
import { Dispatch } from 'redux'; // Import Dispatch

// Define Thunk type for this specific set of actions
export type GuitarThunkAction = ThunkAction<Promise<void>, RootState, unknown, ReduxAction>;


export const getGuitarsStart = (): ReduxAction => ({
  type: actionTypes.GET_GUITARS_START,
});

export const getGuitarsSuccess = (guitars: Guitar[]): ReduxAction<Guitar[]> => ({
  type: actionTypes.GET_GUITARS_SUCCESS,
  payload: guitars,
});

export const getGuitarsFailure = (error: string): ReduxAction<string> => ({
  type: actionTypes.GET_GUITARS_FAILURE,
  payload: error,
});

// Asynchronous thunk action to fetch guitars
export const fetchGuitars = (): GuitarThunkAction => async (dispatch: Dispatch<ReduxAction>) => {
  dispatch(getGuitarsStart());
  try {
    const guitars = await fetchGuitarsAPI();
    dispatch(getGuitarsSuccess(guitars));
  } catch (error: any) {
    dispatch(getGuitarsFailure(error.message || 'Failed to fetch guitars'));
  }
};
