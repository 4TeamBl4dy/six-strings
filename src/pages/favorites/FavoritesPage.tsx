import { useEffect, useCallback } from 'react'; // Removed useState
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Grid, Box, Container } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
// API calls for favorites will be handled by thunks
import { addItemToBasket as addItemToBasketThunk, fetchBasket } from 'src/store/basketSlice';
import { fetchFavoritesThunk, removeItemFromFavoritesThunk, clearUserFavoritesThunk } from 'src/store/favoriteSlice';
import { AppDispatch, RootState } from 'src/store/store';
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
import { Loader } from 'src/components';
import { FavoriteItem } from 'src/types'; // BasketItem is sourced from Redux store

export const FavoritesPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { items: favorites, isLoading: loading, error } = useSelector((state: RootState) => state.favorites);
  const basketItems = useSelector((state: RootState) => state.basket.items); // For checking if item is in basket
  const localError = useSelector((state: RootState) => state.basket.error); // Get basket error state

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        // Dispatch an action or rely on a global auth listener to redirect
        navigate('/login');
        return;
    }
    dispatch(fetchFavoritesThunk());
    if (basketItems.length === 0) { // Fetch basket items if not already in store
        dispatch(fetchBasket());
    }
  }, [dispatch, navigate, basketItems.length]); // Added basketItems.length to dependencies

  const handleAddItemToCart = useCallback(
    (guitarId: string, guitarImg: string, guitarName: string, guitarCost: number, guitarAmount: number) => {
      const isAlreadyInBasket = basketItems.some((item) => item.guitarId === guitarId);
      if (isAlreadyInBasket) {
        // Consider dispatching a notification error instead of local state
        alert('Этот товар уже есть в вашей корзине.');
        return;
      }

      if (guitarAmount === 0) {
        alert('Товара нет в наличии.');
        return;
      }
      
      dispatch(addItemToBasketThunk({ guitarId, guitarImg, guitarName, guitarCost, guitarAmount: 1 }))
        .unwrap()
        .then(() => {
          alert('Товар успешно добавлен в корзину');
        })
        .catch((addError: any) => {
          console.error('Ошибка при добавлении в корзину:', addError);
          // Error will be in Redux state (state.basket.error), display it or use a notification
          alert(typeof addError === 'string' ? addError : 'Ошибка при добавлении товара в корзину.');
        });
    },
    [dispatch, basketItems]
  );

  const handleRemoveItemFromFavorites = (guitarId: string) => {
    dispatch(removeItemFromFavoritesThunk(guitarId))
        .unwrap()
        .catch((removeError: any) => {
            console.error('Ошибка при удалении товара из избранного:', removeError);
            alert(typeof removeError === 'string' ? removeError : 'Ошибка при удалении товара из избранного.');
        });
  };

  const handleRemoveAllFavorites = () => {
    dispatch(clearUserFavoritesThunk())
        .unwrap()
        .catch((clearError: any) => {
            console.error('Ошибка при удалении всех товаров из избранного:', clearError);
            alert(typeof clearError === 'string' ? clearError : 'Ошибка при удалении всех товаров из избранного.');
        });
  };

  if (loading && favorites.length === 0) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }

  return (
    <StyledContainer maxWidth="xl">
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', color: '#FF6428', mb: 2 }}>
        ИЗБРАННОЕ
      </Typography>
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
      {localError && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{localError}</div>} 
      {favorites.length === 0 && !error ? (
        <div style={{ textAlign: 'center' }}>Избранное пусто</div>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <ActionButton onClick={handleRemoveAllFavorites}>Удалить всё</ActionButton>
          </Box>
          <ProductsGrid container>
            {favorites.map((guitar) => {
              const isInBasket = basketItems.some((item) => item.guitarId === guitar.guitarId);
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
                            handleAddItemToCart(
                              guitar.guitarId,
                              guitar.guitarImg,
                              guitar.guitarName,
                              guitar.guitarCost,
                              guitar.guitarAmount
                            )
                          }
                          disabled={guitar.guitarAmount === 0 || isInBasket}
                          sx={{
                            cursor: guitar.guitarAmount === 0 || isInBasket ? 'not-allowed' : 'pointer',
                            opacity: guitar.guitarAmount === 0 || isInBasket ? 0.5 : 1,
                          }}
                        >
                          <AddShoppingCartIcon />
                        </ActionButton>
                        <ActionButton onClick={() => handleRemoveItemFromFavorites(guitar.guitarId)}>
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