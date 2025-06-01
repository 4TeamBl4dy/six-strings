import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Typography, Grid, Box, Container, Button } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleImageError } from 'src/utils';
import { StyledContainer, ProductsGrid, GuitarCard, GuitarCardMedia, GuitarCardContent, ActionButton } from './styles';
import { Loader } from 'src/components';
import { BasketItem, FavoriteItem } from 'src/types';
import apiClient from 'src/api';

export const FavoritesPage = () => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [basket, setBasket] = useState<BasketItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    const fetchFavorites = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('Пожалуйста, войдите в систему.');
            navigate('/login');
            setLoading(false);
            return;
        }

        setLoading(true);
        apiClient
            .get('/favorites', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response: AxiosResponse<FavoriteItem[]>) => {
                setFavorites(response.data || []);
                setLoading(false);
            })
            .catch((error: AxiosError) => {
                setLoading(false);
                console.error('Ошибка при загрузке избранного:', error);
                if (error.response?.status === 401) {
                    setError('Невалидный токен. Пожалуйста, войдите снова.');
                    navigate('/login');
                } else if (error.response?.status === 404) {
                    setError('Избранное не найдено.');
                } else {
                    setError('Произошла ошибка при загрузке избранного.');
                }
            });
    }, [navigate]);

    const fetchBasket = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        apiClient
            .get('/basket', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response: AxiosResponse<BasketItem[]>) => {
                setBasket(response.data || []);
            })
            .catch((error: AxiosError) => {
                console.error('Ошибка при загрузке корзины:', error);
            });
    }, []);

    useEffect(() => {
        fetchFavorites();
        fetchBasket();
    }, [fetchFavorites, fetchBasket]);

    const addCart = useCallback(
        (guitarId: string, guitarImg: string, guitarName: string, guitarCost: number, guitarAmount: number) => {
            const token = localStorage.getItem('access_token');
            const isAlreadyInBasket = basket.some((item) => item.guitarId === guitarId);
            if (isAlreadyInBasket) {
                setError('Этот товар уже есть в вашей корзине.');
                return;
            }

            if (guitarAmount === 0) {
                setError('Товара нет в наличии.');
                return;
            }

            const newBasketItem = { guitarId, guitarImg, guitarName, guitarCost, guitarAmount };
            setBasket((prev) => [...prev, newBasketItem]);

            apiClient
                .post(
                    '/basket',
                    {
                        guitarId,
                        guitarImg,
                        guitarName,
                        guitarCost,
                        guitarAmount,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                .catch((error: AxiosError) => {
                    console.error('Ошибка при добавлении в корзину:', error);
                    setError('Ошибка при добавлении товара в корзину.');
                    setBasket((prev) => prev.filter((item) => item.guitarId !== guitarId));
                });
        },
        [basket]
    );

    const removeFavorite = (guitarId: string) => {
        const token = localStorage.getItem('access_token');
        const prevFavorites = [...favorites];
        setFavorites(favorites.filter((guitar) => guitar.guitarId !== guitarId));

        apiClient({
            method: 'POST',
            url: '/favorites/delete',
            headers: {
                Authorization: `Bearer ${token}`,
                'X-HTTP-Method-Override': 'DELETE',
            },
            data: { guitarId: guitarId },
        }).catch((error: AxiosError) => {
            console.error('Ошибка при удалении товара из избранного:', error);
            setError('Ошибка при удалении товара из избранного.');
            setFavorites(prevFavorites);
        });
    };

    const removeAll = () => {
        const token = localStorage.getItem('access_token');
        const prevFavorites = [...favorites];
        setFavorites([]);

        apiClient
            .patch('/favorites/deleteAll', null, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .catch((error: AxiosError) => {
                console.error('Ошибка при удалении всех товаров из избранного:', error);
                setError('Ошибка при удалении всех товаров из избранного.');
                setFavorites(prevFavorites);
            });
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Loader />
            </Container>
        );
    }

    if (favorites.length === 0 && !error) {
        return (
            <StyledContainer maxWidth="xl">
                <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', color: '#FF6428', mb: 2 }}>
                    ИЗБРАННОЕ
                </Typography>
                <Typography sx={{ textAlign: 'center', marginTop: '20px' }}>Избранное пусто</Typography>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer maxWidth="xl">
            <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', color: '#FF6428', mb: 2 }}>
                ИЗБРАННОЕ
            </Typography>
            {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
            {favorites.length > 0 && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <ActionButton onClick={removeAll}>Удалить всё</ActionButton>
                    </Box>
                    <ProductsGrid container>
                        {favorites.map((guitar) => {
                            const isInBasket = basket.some((item) => item.guitarId === guitar.guitarId);
                            return (
                                <Grid item key={guitar.guitarId} xs={12} sm={6} md={4} lg={3}>
                                    <GuitarCard>
                                        <GuitarCardMedia image={guitar.guitarImg} onError={handleImageError} />
                                        <GuitarCardContent>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                                    {guitar.guitarName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {guitar.guitarCost}₸
                                                </Typography>
                                                {guitar.guitarAmount === 0 && (
                                                    <Typography variant="body2" color="error.main">
                                                        Нет в наличии
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box display="flex" gap={1} mt={1}>
                                                <ActionButton
                                                    onClick={() =>
                                                        addCart(
                                                            guitar.guitarId,
                                                            guitar.guitarImg,
                                                            guitar.guitarName,
                                                            guitar.guitarCost,
                                                            guitar.guitarAmount
                                                        )
                                                    }
                                                    disabled={guitar.guitarAmount === 0 || isInBasket}
                                                    sx={{
                                                        cursor:
                                                            guitar.guitarAmount === 0 || isInBasket
                                                                ? 'not-allowed'
                                                                : 'pointer',
                                                        opacity: guitar.guitarAmount === 0 || isInBasket ? 0.5 : 1,
                                                    }}
                                                >
                                                    <AddShoppingCartIcon />
                                                </ActionButton>
                                                <Button onClick={() => removeFavorite(guitar.guitarId)} color='error'>
                                                    <DeleteIcon />
                                                </Button>
                                            </Box>
                                        </GuitarCardContent>
                                    </GuitarCard>
                                </Grid>
                            );
                        })}
                    </ProductsGrid>
                </>
            )}
        </StyledContainer>
    );
};
