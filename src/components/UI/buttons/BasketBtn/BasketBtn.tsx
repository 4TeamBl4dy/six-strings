import '../styles.css';
import React, { useState, useEffect } from 'react'; // useEffect might not be needed if not fetching local basket
import { useDispatch, useSelector } from 'react-redux';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Guitar } from '../../../../types/product'; // Use global Guitar type
import { AddToBasketPayload } from '../../../../types/basket';
import { AppDispatch, RootState } from '../../../../storage/store';
import { addItemToBasket as addItemToBasketThunk } from '../../../../storage/features/basketSlice';
// Removed local BasketItem interface as it's not used for request/response here

// Тип для пропсов компонента
interface BasketBtnProps {
  guitar: Guitar; // Use the global Guitar type
}

export const BasketBtn = ({ guitar }: BasketBtnProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: basketItems, isLoading: isBasketLoading, error: basketError } = useSelector((state: RootState) => state.basket);
  // isUpdating or a specific flag for add item might be in basketSlice, e.g. state.basket.itemBeingAdded === guitar._id

  const isOutOfStock = guitar.amount === 0;
  // Determine isInBasket based on Redux store
  const isInBasket = basketItems.some(item => item.guitarId === guitar._id);

  // Local state for specific feedback from this button's action attempt
  const [actionError, setActionError] = useState<string | null>(null);


  const handleAddToBasket = async () => {
    setActionError(null); // Clear previous action error

    if (isOutOfStock) {
      alert('Товара нет в наличии'); // Or setActionError
      return;
    }
    if (isInBasket) {
      alert('Этот товар уже есть в вашей корзине'); // Or setActionError
      return;
    }

    const payload: AddToBasketPayload = {
      guitarId: guitar._id, // Use _id from Guitar type
      guitarImg: guitar.img,
      guitarName: guitar.name,
      guitarCost: guitar.cost,
      guitarAmount: guitar.amount, // This is total stock
    };

    dispatch(addItemToBasketThunk(payload))
      .unwrap()
      .then(() => {
        alert('Товар успешно добавлен в корзину');
        // setIsInBasket(true) is not needed as isInBasket is derived from Redux state
      })
      .catch((errorPayload) => {
        setActionError((errorPayload as string) || 'Ошибка при добавлении товара в корзину');
        // alert is an alternative to setting state error if preferred
        // alert((errorPayload as string) || 'Ошибка при добавлении товара в корзину');
      });
  };
  
  // Display general basket error if it exists and no specific action error
  const displayError = actionError || basketError;


  return (
    <button
      className="basketBtn"
      onClick={handleAddToBasket}
      disabled={isOutOfStock || isInBasket || isBasketLoading} // Disable if already in basket or if general basket is loading/updating
      style={{
        cursor: isOutOfStock || isInBasket || isBasketLoading ? 'not-allowed' : 'pointer',
        opacity: isOutOfStock || isInBasket || isBasketLoading ? 0.5 : 1,
      }}
    >
      <AddShoppingCartIcon />
    </button>
  );
};