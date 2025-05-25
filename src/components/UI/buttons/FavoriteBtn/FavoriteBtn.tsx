import { useEffect, useMemo } from 'react'; // Removed useState
import '../styles.css';
import { useDispatch, useSelector } from 'react-redux';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite'; // For filled heart
import { Guitar } from 'src/types'; // FavoriteItem is not directly used as prop
import { AppDispatch, RootState } from 'src/store/store';
import { addItemToFavoritesThunk, removeItemFromFavoritesThunk, fetchFavoritesThunk } from 'src/store/favoriteSlice';

interface FavoriteBtnProps {
  guitar: Guitar; // Assuming Guitar type includes _id, img, name, amount, cost
}

export const FavoriteBtn = ({ guitar }: FavoriteBtnProps) => {
  const dispatch: AppDispatch = useDispatch();
  const favoriteItems = useSelector((state: RootState) => state.favorites.items);
  // const isLoading = useSelector((state: RootState) => state.favorites.isLoading); // Optional for button loading state

  const isFavorite = useMemo(() => favoriteItems.some(item => item.guitarId === guitar._id), [favoriteItems, guitar._id]);

  useEffect(() => {
    // Fetch favorites if not already loaded or to ensure freshness.
    // Consider a 'loadedOnce' flag or similar in the slice for more complex scenarios.
    const token = localStorage.getItem('access_token');
    if (token && favoriteItems.length === 0) { // Only fetch if token exists and favorites are not loaded
        dispatch(fetchFavoritesThunk());
    }
  }, [dispatch, favoriteItems.length]);

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      try {
        await dispatch(removeItemFromFavoritesThunk(guitar._id)).unwrap();
        // Optional: show success notification
      } catch (error: any) {
        console.error('Ошибка при удалении из избранного:', error);
        alert(error.message || 'Ошибка при удалении из избранного');
      }
    } else {
      try {
        await dispatch(addItemToFavoritesThunk({
          guitarId: guitar._id,
          guitarImg: guitar.img,
          guitarName: guitar.name,
          guitarAmount: guitar.amount, // This is the total available amount
          guitarCost: guitar.cost,
        })).unwrap();
        alert('Товар успешно добавлен в избранное');
      } catch (error: any) {
        console.error('Ошибка при добавлении в избранное:', error);
        alert(error.message || 'Ошибка при добавлении в избранное');
      }
    }
  };

  return (
    <button
      className="favoriteBtn"
      onClick={handleToggleFavorite}
      // disabled={isLoading} // Optional: disable button while loading
      style={{
        cursor: 'pointer', // Keep pointer cursor as it's always clickable
        // opacity: isLoading ? 0.5 : 1, // Optional: change opacity when loading
      }}
    >
      {isFavorite ? <FavoriteIcon sx={{color: 'red'}} /> : <FavoriteBorderIcon />}
    </button>
  );
};