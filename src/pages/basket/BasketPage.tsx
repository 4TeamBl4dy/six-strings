import { useState, useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleImageError } from 'src/utils';
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
import { PaymentModalWrapper, Loader } from 'src/components';
import { BasketItem } from 'src/types';
import apiClient from 'src/api';

export const Basket = () => {
    const [basket, setBasket] = useState<BasketItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [openPayment, setOpenPayment] = useState(false);

    const navigate = useNavigate();

    const calculateSum = (items: BasketItem[]) => {
        return items.reduce((total, g) => total + g.guitarCost * g.guitarCount, 0);
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('Пожалуйста, войдите в систему.');
            navigate('/login');
            setLoading(false);
            return;
        }

        setLoading(true);
        apiClient
            .get('/basket', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response: AxiosResponse<BasketItem[]>) => {
                const data = response.data;
                setBasket(data);
                setLoading(false);
            })
            .catch((error: AxiosError) => {
                setLoading(false);
                if (error.response?.status === 401) {
                    setError('Невалидный токен. Пожалуйста, войдите снова.');
                    navigate('/login');
                } else if (error.response?.status === 404) {
                    setError('Корзина не найдена.');
                } else {
                    setError('Произошла ошибка при загрузке корзины.');
                }
            });
    }, [navigate]);

    const updateCount = (id: string, delta: number) => {
        const token = localStorage.getItem('access_token');
        const guitar = basket.find((g) => g.guitarId === id);
        if (!guitar) return;

        const newCount = guitar.guitarCount + delta;
        if (newCount < 1 || newCount > guitar.guitarAmount) return;

        const updatedBasket = basket.map((g) => (g.guitarId === id ? { ...g, guitarCount: newCount } : g));
        setBasket(updatedBasket);

        apiClient
            .put(
                `/basket/${id}`,
                {
                    action: delta > 0 ? 'plus' : 'minus',
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .catch(() => {
                setError('Ошибка при изменении количества товара.');
                // Возврат к предыдущему состоянию
                setBasket(basket);
            });
    };

    const removeBasket = (id: string) => {
        const token = localStorage.getItem('access_token');
        const updatedBasket = basket.filter((g) => g.guitarId !== id);
        setBasket(updatedBasket);

        apiClient({
            method: 'POST',
            url: '/basket/delete',
            headers: {
                Authorization: `Bearer ${token}`,
                'X-HTTP-Method-Override': 'DELETE',
            },
            data: { guitarId: id },
        }).catch(() => {
            setError('Ошибка при удалении товара из корзины.');
            setBasket(basket);
        });
    };

    const removeAll = () => {
        const token = localStorage.getItem('access_token');
        const prevBasket = [...basket];
        setBasket([]);

        apiClient
            .patch('/basket/delete', null, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => {
                setError('Ошибка при удалении всех товаров из корзины.');
                setBasket(prevBasket);
            });
    };

    const handlePaymentSuccess = async () => {
        const token = localStorage.getItem('access_token');
        try {
            await apiClient.post(
                '/basket/confirm',
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            navigate('/');
        } catch {
            setError('Ошибка при подтверждении покупки');
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Loader />
            </Container>
        );
    }

    const sum = calculateSum(basket);

    if (basket.length === 0 && !error) {
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
            {error && <Typography color="error">{error}</Typography>}
            <Button color={'error'} onClick={removeAll}>
                Очистить корзину
            </Button>
            {basket.map((guitar) => (
                <GuitarItem key={guitar.guitarId}>
                    <GuitarImage src={guitar.guitarImg} alt={guitar.guitarName} onError={handleImageError} />
                    <GuitarName variant="h6">{guitar.guitarName}</GuitarName>
                    <Box display="flex" alignItems="center">
                        <CountButton onClick={() => updateCount(guitar.guitarId, 1)}>+</CountButton>
                        <CountText>{guitar.guitarCount} шт</CountText>
                        <CountButton onClick={() => updateCount(guitar.guitarId, -1)}>-</CountButton>
                    </Box>
                    <Typography>{guitar.guitarCost} ₸</Typography>
                    <DeleteButton onClick={() => removeBasket(guitar.guitarId)}>
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
