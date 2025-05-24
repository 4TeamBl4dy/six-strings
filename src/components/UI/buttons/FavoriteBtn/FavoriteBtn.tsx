import React, { useState, useEffect } from 'react'; // Keep useState for actionError if needed
import '../styles.css';
import { useDispatch, useSelector } from 'react-redux';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite'; // For filled icon
import { Guitar } from '../../../../types/product'; // Use global Guitar type
import { AppDispatch, RootState } from '../../../../storage/store';
import { 
  addFavoriteItem, 
  removeFavoriteItemById,
  // fetchFavoritesList // Not typically fetched by each button, but by parent page
} from '../../../../storage/features/favoritesSlice';

// Removed local Guitar and FavoriteItem interfaces

// Тип для пропсов компонента
interface FavoriteBtnProps {
  guitar: Guitar; // Use the global Guitar type
}

export const FavoriteBtn = ({ guitar }: FavoriteBtnProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: favoriteItems, isUpdating, updateError } = useSelector((state: RootState) => state.favorites);
  
  // Determine if the current guitar is in favorites based on Redux store
  const isInFavorites = favoriteItems.some(item => item.guitarId === guitar._id);

  // Local state for specific feedback from this button's action attempt
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    // If there's a global updateError from the slice related to this item, show it
    // This depends on how specific updateError is set in the slice.
    // For simplicity, we can just show a generic alert from .catch()
    if (updateError) {
        // setActionError(updateError); // Or directly use updateError for display
    }
  }, [updateError]);


  const handleToggleFavorite = async () => {
    setActionError(null); // Clear previous action error

    const actionToDispatch = isInFavorites
      ? removeFavoriteItemById(guitar._id)
      : addFavoriteItem(guitar._id); // addFavoriteItem expects productId

    dispatch(actionToDispatch)
      .unwrap()
      .then(() => {
        // Optional: success alert or notification
        // alert(isInFavorites ? 'Удалено из избранного!' : 'Добавлено в избранное!');
      })
      .catch((errorPayload) => {
        const errorMessage = (errorPayload as string) || (isInFavorites ? 'Ошибка при удалении из избранного' : 'Ошибка при добавлении в избранное');
        setActionError(errorMessage);
        alert(errorMessage); // Simple feedback
      });
  };

  // Display actionError or general favorites updateError
  // const displayError = actionError || updateError; // updateError is now handled in useEffect or via alert

  return (
    <button
      className="favoriteBtn"
      onClick={handleToggleFavorite}
      disabled={isUpdating} // Disable button during any favorite update operation
      style={{
        cursor: isUpdating ? 'not-allowed' : 'pointer',
        // Opacity can be handled by CSS based on disabled state if preferred
      }}
    >
      {isInFavorites ? <FavoriteIcon sx={{ color: 'red' }} /> : <FavoriteBorderIcon />}
    </button>
  );
};