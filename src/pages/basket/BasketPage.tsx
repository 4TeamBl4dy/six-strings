import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleImageError } from 'src/utils';
import {BasketContainer, BasketTitle, DeleteAllButton, GuitarItem, GuitarImage, CountButton, CountText, DeleteButton, BasketFooter, BuyButton, GuitarName } from './styles'
import {
  Box,
  Typography,
  Container
} from '@mui/material';
import { PaymentModalWrapper, Loader } from 'src/components';
// BasketItem type is used by the slice, not directly here anymore.
import { AppDispatch, RootState } from 'src/storage/store';
import {
  fetchBasket,
  updateBasketItem,
  removeItemFromBasket,
  clearUserBasket,
  confirmUserPurchase,
} from 'src/storage/features/basketSlice';

export const Basket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: basketItems, loading, error, sum } = useSelector((state: RootState) => state.basket);
  const navigate = useNavigate();

  // Local UI state
  const [openPayment, setOpenPayment] = useState(false);
  // Local error state for cases where Redux state update might not be immediate or for non-Redux errors
  const [localError, setLocalError] = useState<string | null>(null);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);


  useEffect(() => {
    // Use isAuthenticated from Redux store instead of direct token check
    if (!isAuthenticated) {
      setLocalError('Пожалуйста, войдите в систему для просмотра корзины.'); 
      navigate('/login');
      return;
    }
    // Clear local error if authenticated and proceeding to fetch
    setLocalError(null); 
    dispatch(fetchBasket())
      .unwrap()
      .catch(err => {
         // err should be the string from rejectWithValue in the thunk
        setLocalError(err.message || 'Failed to fetch basket on mount');
        if (err.message?.includes('войдите в систему') || err.message?.includes('Невалидный токен')) {
          navigate('/login');
        }
      });
  }, [dispatch, navigate]);

  const countPlus = async (guitarId: string) => {
    // Find the specific item to check its current count and amount
    const item = basketItems.find(i => i.guitarId === guitarId);
    if (!item || item.guitarCount >= item.guitarAmount) {
      // Optionally set a local error or just prevent action
      setLocalError('Нельзя добавить больше этого товара.');
      return; 
    }
    setLocalError(null); // Clear previous local errors
    dispatch(updateBasketItem({ guitarId, action: 'plus' }))
        .unwrap()
        .catch(err => setLocalError(err.message || 'Ошибка при увеличении количества товара.'));
  };

  const countMinus = async (guitarId: string) => {
    const item = basketItems.find(i => i.guitarId === guitarId);
    if (!item || item.guitarCount <= 1) {
       // Optionally set a local error or just prevent action
      setLocalError('Количество не может быть меньше 1.');
      return;
    }
    setLocalError(null); // Clear previous local errors
    dispatch(updateBasketItem({ guitarId, action: 'minus' }))
        .unwrap()
        .catch(err => setLocalError(err.message || 'Ошибка при уменьшении количества товара.'));
  };

  const removeBasketItemHandler = async (guitarId: string) => {
    setLocalError(null);
    dispatch(removeItemFromBasket(guitarId))
        .unwrap()
        .catch(err => setLocalError(err.message || 'Ошибка при удалении товара из корзины.'));
  };

  const removeAllHandler = async () => {
    setLocalError(null);
    dispatch(clearUserBasket())
        .unwrap()
        .catch(err => setLocalError(err.message || 'Ошибка при удалении всех товаров из корзины.'));
  };

  const handlePaymentSuccess = async () => {
    setLocalError(null);
    dispatch(confirmUserPurchase())
      .unwrap()
      .then(() => {
        navigate('/');
      })
      .catch(err => {
        setLocalError(err.message || 'Ошибка при подтверждении покупки');
      });
  };
  
  // Combine Redux error with local error for display
  const displayError = error || localError;

  if (loading === 'pending' && basketItems.length === 0) { // Show loader only if basket is empty and pending
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }

  return (
    <BasketContainer>
      <BasketTitle variant="h4">КОРЗИНА</BasketTitle>
      {displayError && <Typography color="error" sx={{textAlign: 'center', mb: 2}}>{displayError}</Typography>}
      {loading === 'succeeded' && basketItems.length === 0 && !displayError ? (
        <Typography sx={{textAlign: 'center'}}>Корзина пуста</Typography>
      ) : (
        <>
          <DeleteAllButton onClick={removeAllHandler} disabled={loading === 'pending' || basketItems.length === 0}>Удалить всё</DeleteAllButton>
          {basketItems.map((item) => (
            <GuitarItem key={item.guitarId}>
              <GuitarImage src={item.guitarImg} alt={item.guitarName} onError={handleImageError} />
              <GuitarName variant="h6">{item.guitarName}</GuitarName>
              <Box display="flex" alignItems="center">
                <CountButton onClick={() => countPlus(item.guitarId)} disabled={loading === 'pending' || item.guitarCount >= item.guitarAmount}>+</CountButton>
                <CountText>{item.guitarCount} шт</CountText>
                <CountButton onClick={() => countMinus(item.guitarId)} disabled={loading === 'pending' || item.guitarCount <= 1}>-</CountButton>
              </Box>
              <Typography>{item.guitarCost} ₸</Typography>
              <DeleteButton onClick={() => removeBasketItemHandler(item.guitarId)} disabled={loading === 'pending'}>
                <DeleteIcon sx={{ width: 30, height: 30 }} />
              </DeleteButton>
            </GuitarItem>
          ))}
          <BasketFooter>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              Итого: <strong>{sum} ₸</strong>
            </Typography>
            <BuyButton onClick={() => setOpenPayment(true)} disabled={loading === 'pending' || basketItems.length === 0}>Купить</BuyButton>
            <PaymentModalWrapper
              open={openPayment}
              onClose={() => setOpenPayment(false)}
              amount={sum}
              onSuccess={handlePaymentSuccess}
            />
          </BasketFooter>
        </>
      )}
    </BasketContainer>
  );
};
