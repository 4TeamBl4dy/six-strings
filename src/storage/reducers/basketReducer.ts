// src/storage/reducers/basketReducer.ts
import { BasketItem, ReduxAction } from 'src/types';
import * as actionTypes from '../actionTypes';

export interface BasketState {
  items: BasketItem[];
  loading: boolean;
  error: string | null;
}

const initialState: BasketState = {
  items: [],
  loading: false,
  error: null,
};

export const basketReducer = (state = initialState, action: ReduxAction): BasketState => {
  switch (action.type) {
    case actionTypes.GET_BASKET_START:
    case actionTypes.ADD_TO_BASKET_START:
    case actionTypes.UPDATE_BASKET_ITEM_START:
    case actionTypes.REMOVE_FROM_BASKET_START:
    case actionTypes.CLEAR_BASKET_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.GET_BASKET_SUCCESS:
      return {
        ...state,
        items: action.payload as BasketItem[],
        loading: false,
      };
    case actionTypes.ADD_TO_BASKET_SUCCESS:
      // Assuming payload is the new BasketItem to be added or updated if it exists
      // More sophisticated logic might be needed if items can be partially updated
      const newItem = action.payload as BasketItem;
      const existingItemIndex = state.items.findIndex(item => item.guitarId === newItem.guitarId);
      if (existingItemIndex > -1) {
        // Item exists, update it (e.g. quantity)
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = newItem;
        return { ...state, items: updatedItems, loading: false };
      }
      return {
        ...state,
        items: [...state.items, newItem],
        loading: false,
      };
    case actionTypes.UPDATE_BASKET_ITEM_SUCCESS:
      const updatedItem = action.payload as BasketItem;
      return {
        ...state,
        items: state.items.map(item =>
          item.guitarId === updatedItem.guitarId ? updatedItem : item
        ),
        loading: false,
      };
    case actionTypes.REMOVE_FROM_BASKET_SUCCESS:
      return {
        ...state,
        items: state.items.filter(item => item.guitarId !== (action.payload as string)),
        loading: false,
      };
    case actionTypes.CLEAR_BASKET_SUCCESS:
      return {
        ...state,
        items: [],
        loading: false,
      };

    case actionTypes.GET_BASKET_FAILURE:
    case actionTypes.ADD_TO_BASKET_FAILURE:
    case actionTypes.UPDATE_BASKET_ITEM_FAILURE:
    case actionTypes.REMOVE_FROM_BASKET_FAILURE:
    case actionTypes.CLEAR_BASKET_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload as string,
      };
    default:
      return state;
  }
};
