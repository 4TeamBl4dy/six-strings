import { useEffect, useCallback } from 'react'; // Removed useState
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { Typography, Grid, Box, Container } from '@mui/material';
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
import {Loader} from 'src/components';
import { FavoriteProduct } from '../../types/favorites';
import { AddToBasketPayload } from '../../types/basket';
import { AppDispatch, RootState } from '../../storage/store';
import { 
  fetchFavoritesList, 
  removeFavoriteItemById, 
  clearAllUserFavorites,
  clearFavoritesUpdateError, // To clear errors, e.g., on unmount
} from '../../storage/features/favoritesSlice';
import { addItemToBasket as addItemToBasketThunk } from '../../storage/features/basketSlice';
import { ROUTES } from 'src/constants';


export const FavoritesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { 
    items: favoriteItems, 
    isLoading: isFavoritesLoading, 
    error: favoritesError, 
    isUpdating: isFavoritesUpdating,
    updateError: favoritesUpdateError 
  } = useSelector((state: RootState) => state.favorites);
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: basketItemsFromStore, error: basketError } = useSelector((state: RootState) => state.basket); // For isInBasket check

  // Local error for add to cart, as basketSlice might not have specific error state for this action alone
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    } else {
      dispatch(fetchFavoritesList());
    }
    return () => {
        dispatch(clearFavoritesUpdateError()); // Clear update errors on unmount
    };
  }, [dispatch, isAuthenticated, navigate]);

  const handleAddCart = useCallback(
    async (item: FavoriteProduct) => {
      if (item.guitarAmount === 0) {
        setAddToCartError('Товара нет в наличии.');
        return;
      }
      // Check if item is already in basket using Redux state
      const isAlreadyInBasket = basketItemsFromStore.some((bItem) => bItem.guitarId === item.guitarId);
      if (isAlreadyInBasket) {
        setAddToCartError('Этот товар уже есть в вашей корзине.');
        return;
      }
      setAddToCartError(null);

      const payload: AddToBasketPayload = {
        guitarId: item.guitarId,
        guitarImg: item.guitarImg,
        guitarName: item.guitarName,
        guitarCost: item.guitarCost,
        guitarAmount: item.guitarAmount,
      };

      dispatch(addItemToBasketThunk(payload))
        .unwrap()
        .then(() => {
          alert(`${item.guitarName} добавлен в корзину!`);
          // Optionally dispatch fetchBasket or rely on optimistic update in basketSlice
        })
        .catch((errorPayload) => {
          setAddToCartError((errorPayload as string) || 'Ошибка при добавлении товара в корзину.');
        });
    },
    [dispatch, basketItemsFromStore]
  );

  const handleRemoveFavorite = (guitarId: string) => {
    dispatch(removeFavoriteItemById(guitarId));
  };

  const handleClearAllFavorites = () => {
    dispatch(clearAllUserFavorites());
  };
  
  const displayError = favoritesError || favoritesUpdateError || addToCartError || basketError;

  if (isFavoritesLoading) {
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
      {displayError && <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>{displayError}</Typography>}
      {favoriteItems.length === 0 && !isFavoritesLoading && !displayError ? (
        <Typography sx={{ textAlign: 'center' }}>Избранное пусто</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <ActionButton onClick={handleClearAllFavorites} disabled={isFavoritesUpdating || favoriteItems.length === 0}>
              Удалить всё
            </ActionButton>
          </Box>
          <ProductsGrid container>
            {favoriteItems.map((guitar) => {
              const isInBasket = basketItemsFromStore.some((bItem) => bItem.guitarId === guitar.guitarId);
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
                          onClick={() => handleAddCart(guitar)}
                          disabled={guitar.guitarAmount === 0 || isInBasket || isFavoritesUpdating}
                          sx={{
                            cursor: guitar.guitarAmount === 0 || isInBasket ? 'not-allowed' : 'pointer',
                            opacity: guitar.guitarAmount === 0 || isInBasket ? 0.5 : 1,
                          }}
                        >
                          <AddShoppingCartIcon />
                        </ActionButton>
                        <ActionButton onClick={() => removeFavoriteHandler(guitar.guitarId)}>
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