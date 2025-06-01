import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleImageError } from 'src/utils';
import { useBasket } from 'src/contexts';
import {
    BasketContainer,
    BasketTitle,
    GuitarItem,
    GuitarImage,
    CountButton,
    CountText,
    DeleteButton,
    BasketFooter,
    BuyButton,
    GuitarName,
} from './styles';
import { Box, Typography, Container, Button } from '@mui/material';
import { PaymentModalWrapper, Loader, useToast } from 'src/components';
import { BasketItem } from 'src/types';
import apiClient from 'src/api'; // Keep apiClient for handlePaymentSuccess

export const Basket = () => {
    const { basketItems, loading, error: contextError, updateBasketItemCount, removeFromBasket, clearBasket, fetchBasket } = useBasket();
    const [openPayment, setOpenPayment] = useState(false);
    const { showToast } = useToast(); // Assuming useToast might be needed for payment success/error

    const navigate = useNavigate();

    const calculateSum = (items: BasketItem[]) => {
        return items.reduce((total, g) => total + g.guitarCost * g.guitarCount, 0);
    };

    const handlePaymentSuccess = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Пожалуйста, войдите в систему для подтверждения покупки.', 'error');
            navigate('/login');
            return;
        }
        try {
            await apiClient.post(
                '/basket/confirm',
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            showToast('Покупка успешно подтверждена!', 'success');
            await fetchBasket(); // Refetch basket to update state (likely to empty it)
            navigate('/');
        } catch (err) {
            console.error('Error confirming payment:', err);
            showToast('Ошибка при подтверждении покупки', 'error');
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Loader />
            </Container>
        );
    }

    const sum = calculateSum(basketItems);

    if (basketItems.length === 0 && !contextError) {
        return (
            <BasketContainer>
                <BasketTitle variant="h4">КОРЗИНА</BasketTitle>
                <Typography sx={{ textAlign: 'center', marginTop: '20px' }}>Корзина пуста</Typography>
            </BasketContainer>
        );
    }

    return (
        <BasketContainer>
            <BasketTitle variant="h4">КОРЗИНА</BasketTitle>
            {contextError && <Typography color="error">{contextError}</Typography>}
            <Button color={'error'} onClick={clearBasket}>
                Очистить корзину
            </Button>
            {basketItems.map((guitar) => (
                <GuitarItem key={guitar.guitarId}>
                    <GuitarImage src={guitar.guitarImg} alt={guitar.guitarName} onError={handleImageError} />
                    <GuitarName variant="h6">{guitar.guitarName}</GuitarName>
                    <Box display="flex" alignItems="center">
                        <CountButton onClick={() => updateBasketItemCount(guitar.guitarId, 'plus')}>+</CountButton>
                        <CountText>{guitar.guitarCount} шт</CountText>
                        <CountButton onClick={() => updateBasketItemCount(guitar.guitarId, 'minus')}>-</CountButton>
                    </Box>
                    <Typography>{guitar.guitarCost} ₸</Typography>
                    <DeleteButton onClick={() => removeFromBasket(guitar.guitarId)}>
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
        </BasketContainer>
    );
};
