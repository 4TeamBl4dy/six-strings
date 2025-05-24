// src/storage/actions/basketActions.ts
import { BasketItem, Guitar, ReduxAction, RootState } from 'src/types';
import * as actionTypes from '../actionTypes';
import {
  fetchBasketAPI,
  addItemToBasketAPI,
  updateBasketItemQuantityAPI,
  removeBasketItemAPI,
  clearBasketAPI
} from 'src/api';
import { ThunkAction } from 'redux-thunk';
import { Dispatch } from 'redux';

// Define Thunk type for basket actions
export type BasketThunkAction<R = void> = ThunkAction<Promise<R>, RootState, unknown, ReduxAction>;

// Get Basket
export const getBasketStart = (): ReduxAction => ({
  type: actionTypes.GET_BASKET_START,
});

export const getBasketSuccess = (items: BasketItem[]): ReduxAction<BasketItem[]> => ({
  type: actionTypes.GET_BASKET_SUCCESS,
  payload: items,
});

export const getBasketFailure = (error: string): ReduxAction<string> => ({
  type: actionTypes.GET_BASKET_FAILURE,
  payload: error,
});

export const fetchBasket = (): BasketThunkAction => async (dispatch: Dispatch<ReduxAction>) => {
  dispatch(getBasketStart());
  try {
    const items = await fetchBasketAPI();
    dispatch(getBasketSuccess(items));
  } catch (error: any) {
    dispatch(getBasketFailure(error.message || 'Failed to fetch basket'));
  }
};

// Add to Basket
// Note: The addItemToBasketAPI might need the full Guitar object or more details.
// This thunk assumes guitarId and quantity are sufficient as per current api/index.ts.
export const addToBasketStart = (): ReduxAction => ({
  type: actionTypes.ADD_TO_BASKET_START,
});

export const addToBasketSuccess = (item: BasketItem): ReduxAction<BasketItem> => ({
  type: actionTypes.ADD_TO_BASKET_SUCCESS,
  payload: item,
});

export const addToBasketFailure = (error: string): ReduxAction<string> => ({
  type: actionTypes.ADD_TO_BASKET_FAILURE,
  payload: error,
});

export const addItemToBasket = (guitarId: string, quantity: number): BasketThunkAction<BasketItem | void> => async (dispatch: Dispatch<ReduxAction>) => {
  dispatch(addToBasketStart());
  try {
    const newItem = await addItemToBasketAPI(guitarId, quantity);
    dispatch(addToBasketSuccess(newItem));
    return newItem;
  } catch (error: any) {
    dispatch(addToBasketFailure(error.message || 'Failed to add item to basket'));
  }
};

// Update Basket Item Quantity
export const updateBasketItemStart = (): ReduxAction => ({
    type: actionTypes.UPDATE_BASKET_ITEM_START,
});

export const updateBasketItemSuccess = (item: BasketItem): ReduxAction<BasketItem> => ({
  type: actionTypes.UPDATE_BASKET_ITEM_SUCCESS,
  payload: item,
});

export const updateBasketItemFailure = (error: string): ReduxAction<string> => ({
  type: actionTypes.UPDATE_BASKET_ITEM_FAILURE,
  payload: error,
});

export const updateBasketItemQuantity = (guitarId: string, action: 'plus' | 'minus'): BasketThunkAction<BasketItem | void> => async (dispatch: Dispatch<ReduxAction>) => {
  dispatch(updateBasketItemStart());
  try {
    const updatedItem = await updateBasketItemQuantityAPI(guitarId, action);
    dispatch(updateBasketItemSuccess(updatedItem));
    // Optionally, fetch the entire basket again to ensure consistency if the backend doesn't return the full updated item
    // await dispatch(fetchBasket());
    return updatedItem;
  } catch (error: any) {
    dispatch(updateBasketItemFailure(error.message || 'Failed to update basket item'));
  }
};

// Remove From Basket
export const removeFromBasketStart = (): ReduxAction => ({
    type: actionTypes.REMOVE_FROM_BASKET_START,
});

export const removeFromBasketSuccess = (itemId: string): ReduxAction<string> => ({
  type: actionTypes.REMOVE_FROM_BASKET_SUCCESS,
  payload: itemId, // API returns void, so we pass itemId to reducer
});

export const removeFromBasketFailure = (error: string): ReduxAction<string> => ({
  type: actionTypes.REMOVE_FROM_BASKET_FAILURE,
  payload: error,
});

export const removeItemFromBasket = (guitarId: string): BasketThunkAction => async (dispatch: Dispatch<ReduxAction>) => {
  dispatch(removeFromBasketStart());
  try {
    await removeBasketItemAPI(guitarId);
    dispatch(removeFromBasketSuccess(guitarId));
     // Optionally, fetch the entire basket again
    // await dispatch(fetchBasket());
  } catch (error: any) {
    dispatch(removeFromBasketFailure(error.message || 'Failed to remove item from basket'));
  }
};

// Clear Basket
export const clearBasketStart = (): ReduxAction => ({
    type: actionTypes.CLEAR_BASKET_START,
});

export const clearBasketSuccess = (): ReduxAction => ({
  type: actionTypes.CLEAR_BASKET_SUCCESS,
});

export const clearBasketFailure = (error: string): ReduxAction<string> => ({
  type: actionTypes.CLEAR_BASKET_FAILURE,
  payload: error,
});

export const clearUserBasket = (): BasketThunkAction => async (dispatch: Dispatch<ReduxAction>) => {
  dispatch(clearBasketStart());
  try {
    await clearBasketAPI();
    dispatch(clearBasketSuccess());
  } catch (error: any) {
    dispatch(clearBasketFailure(error.message || 'Failed to clear basket'));
  }
};
