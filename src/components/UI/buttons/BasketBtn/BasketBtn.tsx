import '../styles.css';
import {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Guitar, BasketItem } from 'src/types';
import { AppDispatch, RootState } from 'src/store/store'; // Import AppDispatch and RootState
import { addItemToBasket, fetchBasket } from 'src/store/basketSlice'; // Import Redux action


interface BasketBtnProps {
  guitar: Guitar;
}

export const BasketBtn = ({ guitar }: BasketBtnProps) => {
  const dispatch: AppDispatch = useDispatch();
  const isOutOfStock = guitar.amount === 0;
  // Get basket items from Redux store to check if the item is already in the basket
  const basketItems = useSelector((state: RootState) => state.basket.items);
  const isInBasket = useMemo(() => basketItems.some((item) => item.guitarId === guitar._id), [basketItems, guitar._id]);
  
  // Fetch basket on component mount if not already loaded, to ensure isInBasket is accurate
  // This might be redundant if basket is fetched globally or on a parent component
  useEffect(() => {
      const token = localStorage.getItem('access_token');
      if(token && basketItems.length === 0){ // Only fetch if token exists and basket is empty
        dispatch(fetchBasket());
      }
  }, [dispatch, basketItems.length]);


  const handleAddToBasketClick = async () => {
    if (isOutOfStock) {
      alert('Товара нет в наличии');
      return;
    }

    if (isInBasket) {
      alert('Этот товар уже есть в вашей корзине');
      return;
    }

    try {
      await dispatch(addItemToBasket({
        guitarId: guitar._id,
        guitarImg: guitar.img,
        guitarName: guitar.name,
        guitarAmount: 1, // Typically, add 1 item at a time. Or use guitar.amount if that's the logic.
        guitarCost: guitar.cost,
      })).unwrap(); // unwrap to catch potential rejections
      alert('Товар успешно добавлен в корзину');
      // setIsInBasket(true); // No longer needed as isInBasket is derived from Redux state
    } catch (error: any) {
      console.error('Ошибка при добавлении товара в корзину:', error);
      alert(error.message || 'Ошибка при добавлении товара в корзину');
    }
  };

  return (
    <button
      className="basketBtn"
      onClick={handleAddToBasketClick}
      disabled={isOutOfStock || isInBasket} // Отключаем кнопку, если товара нет в наличии или он уже в корзине
      style={{
        cursor: isOutOfStock || isInBasket ? 'not-allowed' : 'pointer',
        opacity: isOutOfStock || isInBasket ? 0.5 : 1,
      }}
    >
      <AddShoppingCartIcon />
    </button>
  );
};