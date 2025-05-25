import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import DeleteIcon from '@mui/icons-material/Delete';
import { handleImageError } from 'src/utils';
// Import Redux actions and types
import { AppDispatch, RootState } from 'src/store/store';
import { fetchBasket, updateBasketItem, removeItemFromBasket, clearUserBasket, confirmUserPurchase } from 'src/store/basketSlice';
import {BasketContainer, BasketTitle, DeleteAllButton, GuitarItem, GuitarImage, CountButton, CountText, DeleteButton, BasketFooter, BuyButton, GuitarName } from './styles'
import {
  Box,
  Typography,
  Container
} from '@mui/material';
import { PaymentModalWrapper, Loader } from 'src/components';
// BasketItem type is already imported via RootState or can be explicitly imported if needed
// import { BasketItem } from 'src/types'; 

export const Basket = () => {
  const dispatch: AppDispatch = useDispatch();
  const { items: basket, isLoading: loading, error } = useSelector((state: RootState) => state.basket);
  
  // Local state for item counts if needed for immediate UI feedback, otherwise derived from `basket`
  // const [count, setCount] = useState<{ [key: string]: number }>({}); 
  const [openPayment, setOpenPayment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Error state is handled by Redux, but navigation can be direct
      // Or dispatch an action that leads to navigation if auth state is also in Redux
      navigate('/login'); 
      return;
    }
    dispatch(fetchBasket());
  }, [dispatch, navigate]); // Added navigate to dependencies

  const sum = useMemo(() => {
    return basket.reduce((total, guitar) => total + guitar.guitarCost * guitar.guitarCount, 0);
  }, [basket]);

  const handleCountPlus = (guitarId: string) => {
    const guitar = basket.find((g) => g.guitarId === guitarId);
    if (!guitar) return;
    // Assuming guitar.guitarCount is the current count from the store
    if (guitar.guitarCount < guitar.guitarAmount) {
      dispatch(updateBasketItem({ guitarId, action: 'plus' }));
    }
  };

  const handleCountMinus = (guitarId: string) => {
    const guitar = basket.find((g) => g.guitarId === guitarId);
    if (!guitar) return;
    if (guitar.guitarCount > 1) {
      dispatch(updateBasketItem({ guitarId, action: 'minus' }));
    }
  };

  const handleRemoveItem = (guitarId: string) => {
    dispatch(removeItemFromBasket(guitarId));
  };

  const handleRemoveAllItems = () => {
    dispatch(clearUserBasket());
  };

  const handlePaymentSuccess = async () => {
    try {
      await dispatch(confirmUserPurchase()).unwrap(); // unwrap to catch potential rejections
      navigate('/');
    } catch (paymentError) {
      // Error is already handled by the thunk's rejected case and stored in Redux `error` state
      // console.error('Ошибка при подтверждении покупки:', paymentError); 
      // Optionally, show a specific notification here if needed beyond global error display
    }
  };

  if (loading && basket.length === 0) { // Show loader if loading and basket is empty
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }

  return (
    <BasketContainer>
      <BasketTitle variant="h4">КОРЗИНА</BasketTitle>
      {error && <Typography color="error">{error}</Typography>}
      {basket.length === 0 && !error ? (
        <Typography>Корзина пуста</Typography>
      ) : (
        <>
          <DeleteAllButton onClick={handleRemoveAllItems}>Удалить всё</DeleteAllButton>
          {basket.map((guitar) => (
            <GuitarItem key={guitar.guitarId}>
              <GuitarImage src={guitar.guitarImg} alt={guitar.guitarName} onError={handleImageError} />
              <GuitarName variant="h6">{guitar.guitarName}</GuitarName>
              <Box display="flex" alignItems="center">
                <CountButton onClick={() => handleCountPlus(guitar.guitarId)}>+</CountButton>
                <CountText>{guitar.guitarCount} шт</CountText> {/* Use guitar.guitarCount from store */}
                <CountButton onClick={() => handleCountMinus(guitar.guitarId)}>-</CountButton>
              </Box>
              <Typography>{guitar.guitarCost} ₸</Typography>
              <DeleteButton onClick={() => handleRemoveItem(guitar.guitarId)}>
                <DeleteIcon sx={{ width: 30, height: 30 }} />
              </DeleteButton>
            </GuitarItem>
          ))}
          <BasketFooter>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              Итого: <strong>{sum} ₸</strong>
            </Typography>
            <BuyButton onClick={() => setOpenPayment(true)}>Купить</BuyButton>
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
