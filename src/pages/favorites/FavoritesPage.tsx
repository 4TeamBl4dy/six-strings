import { Typography, Grid, Box, Container, Button } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleImageError } from 'src/utils';
import { StyledContainer, ProductsGrid, GuitarCard, GuitarCardMedia, GuitarCardContent, ActionButton } from './styles';
import { Loader, useToast } from 'src/components'; // useToast might be needed if context actions show toasts
import { useFavorites, useBasket } from 'src/contexts';
import { Guitar, FavoriteItem } from 'src/types'; // Guitar is needed for addToBasket

export const FavoritesPage = () => {
    const {
        favoriteItems,
        loading: favoritesLoading,
        error: favoritesError,
        removeFromFavorites,
        clearFavorites,
    } = useFavorites();
    const { addToBasket, isItemInBasket, loading: basketLoading } = useBasket();
    // const { showToast } = useToast(); // Uncomment if you need to show additional toasts here

    // Overall loading state can depend on both, or primarily favorites
    const loading = favoritesLoading || basketLoading;

    // For displaying a general error message, prioritize favorites error or create a combined one
    const error = favoritesError; // Simple approach: show favorites error if present

    // The Guitar type might be slightly different from FavoriteItem.
    // addToBasket expects a Guitar object. We need to map FavoriteItem to Guitar.
    // This assumes FavoriteItem contains all necessary fields of Guitar or can be easily mapped.
    // If not, the Guitar type might need to be fetched separately or FavoriteItem enriched.
    const handleAddCart = (favItem: FavoriteItem) => {
        // Map FavoriteItem to Guitar. This is a placeholder mapping.
        // Ensure all required fields for addToBasket are present.
        const guitarForBasket: Guitar = {
            _id: favItem.guitarId, // Assuming guitarId in FavoriteItem maps to _id in Guitar
            name: favItem.guitarName,
            img: favItem.guitarImg,
            cost: favItem.guitarCost,
            amount: favItem.guitarAmount, // This might be tricky if FavoriteItem doesn't store current amount
            // Add other fields like description, type, brand, seller if they are part of Guitar and needed by addToBasket
            // For example, if addToBasket internally checks guitar.description
            description: '', // Placeholder
            type: '', // Placeholder
            brand: '', // Placeholder
            seller: { login: '', name: '', phone: '' }, // Placeholder
        };
        addToBasket(guitarForBasket);
    };


    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Loader />
            </Container>
        );
    }

    if (favoriteItems.length === 0 && !error) {
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
            {favoriteItems.length > 0 && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <ActionButton onClick={clearFavorites}>Удалить всё</ActionButton>
                    </Box>
                    <ProductsGrid container>
                        {favoriteItems.map((guitar) => { // guitar here is actually a FavoriteItem
                            const isInBasket = isItemInBasket(guitar.guitarId);
                            const isOutOfStock = guitar.guitarAmount === 0; // Assuming FavoriteItem has guitarAmount
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
                                                {isOutOfStock && (
                                                    <Typography variant="body2" color="error.main">
                                                        Нет в наличии
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box display="flex" gap={1} mt={1}>
                                                <ActionButton
                                                    onClick={() => handleAddCart(guitar)}
                                                    disabled={isOutOfStock || isInBasket}
                                                    sx={{
                                                        cursor:
                                                            isOutOfStock || isInBasket
                                                                ? 'not-allowed'
                                                                : 'pointer',
                                                        opacity: isOutOfStock || isInBasket ? 0.5 : 1,
                                                    }}
                                                >
                                                    <AddShoppingCartIcon />
                                                </ActionButton>
                                                <Button onClick={() => removeFromFavorites(guitar.guitarId)} color='error'>
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
