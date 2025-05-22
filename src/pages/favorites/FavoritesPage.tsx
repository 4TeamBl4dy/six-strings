import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Typography, Grid, Box } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleImageError } from 'src/utils';
import {
  StyledContainer,
  ProductsGrid,
  GuitarCard,
  GuitarCardMedia,
  GuitarCardContent,
  ActionButton,
} from './styles';

// Тип для объекта в избранном
interface FavoriteItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarAmount: number;
}

// Тип для элемента корзины
interface BasketItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarAmount: number;
}

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>([]); // Состояние для корзины
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('access_token');
  const navigate = useNavigate();

  const fetchFavorites = useCallback(() => {
    if (!token) {
      setError('Пожалуйста, войдите в систему.');
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:8080/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse<FavoriteItem[]>) => {
        setFavorites(response.data || []);
      })
      .catch((error: AxiosError) => {
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
  }, [token, navigate]);

  const fetchBasket = useCallback(() => {
    if (!token) return;

    axios
      .get('http://localhost:8080/basket', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse<BasketItem[]>) => {
        setBasket(response.data || []);
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при загрузке корзины:', error);
      });
  }, [token]);

  useEffect(() => {
    fetchFavorites();
    fetchBasket();
  }, [fetchFavorites, fetchBasket]);

  const addCart = useCallback(
    (guitarId: string, guitarImg: string, guitarName: string, guitarCost: number, guitarAmount: number) => {
      // Проверяем, есть ли товар уже в корзине
      const isAlreadyInBasket = basket.some((item) => item.guitarId === guitarId);
      if (isAlreadyInBasket) {
        setError('Этот товар уже есть в вашей корзине.');
        return;
      }

      // Проверяем наличие товара
      if (guitarAmount === 0) {
        setError('Товара нет в наличии.');
        return;
      }

      axios
        .post(
          'http://localhost:8080/basket',
          {
            guitarId,
            guitarImg,
            guitarName,
            guitarCost,
            guitarAmount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response: AxiosResponse) => {
          console.log('Товар успешно добавлен в корзину:', response.data);
          setBasket((prev) => [
            ...prev,
            { guitarId, guitarImg, guitarName, guitarCost, guitarAmount },
          ]); // Обновляем состояние корзины
        })
        .catch((error: AxiosError) => {
          console.error('Ошибка при добавлении в корзину:', error);
          setError('Ошибка при добавлении товара в корзину.');
        });
    },
    [token, basket]
  );

  const removeFavorite = (guitarId: string) => {
    axios({
      method: 'POST',
      url: 'http://localhost:8080/favorites/delete',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-HTTP-Method-Override': 'DELETE',
      },
      data: { guitarId: guitarId },
    })
      .then((response: AxiosResponse) => {
        setFavorites(favorites.filter((guitar) => guitar.guitarId !== guitarId));
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при удалении товара из избранного:', error);
        setError('Ошибка при удалении товара из избранного.');
      });
  };

  const removeAll = () => {
    axios
      .patch('http://localhost:8080/favorites/delete', null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setFavorites([]);
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при удалении всех товаров из избранного:', error);
        setError('Ошибка при удалении всех товаров из избранного.');
      });
  };

  return (
    <StyledContainer maxWidth="xl">
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', color: '#FF6428', mb: 2 }}>
        ИЗБРАННОЕ
      </Typography>
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
      {favorites.length === 0 && !error ? (
        <div style={{ textAlign: 'center' }}>Избранное пусто</div>
      ) : (
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
                          disabled={guitar.guitarAmount === 0 || isInBasket} // Отключаем кнопку, если товара нет в наличии или он уже в корзине
                          sx={{
                            cursor: guitar.guitarAmount === 0 || isInBasket ? 'not-allowed' : 'pointer',
                            opacity: guitar.guitarAmount === 0 || isInBasket ? 0.5 : 1,
                          }}
                        >
                          <AddShoppingCartIcon />
                        </ActionButton>
                        <ActionButton onClick={() => removeFavorite(guitar.guitarId)}>
                          <DeleteIcon />
                        </ActionButton>
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