import '../styles.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Guitar } from 'src/types';
import { useFavorites } from 'src/contexts';

// Тип для пропсов компонента
interface FavoriteBtnProps {
    guitar: Guitar;
}

export const FavoriteBtn = ({ guitar }: FavoriteBtnProps) => {
    const { addToFavorites, isItemInFavorites } = useFavorites();
    const currentlyInFavorites = isItemInFavorites(guitar._id);

    const handleAddToFavorites = () => {
        addToFavorites(guitar);
    };

    return (
        <button
            className="favoriteBtn"
            onClick={handleAddToFavorites}
            disabled={currentlyInFavorites} // Отключаем кнопку, если товар уже в избранном
            style={{
                cursor: currentlyInFavorites ? 'not-allowed' : 'pointer',
                opacity: currentlyInFavorites ? 0.5 : 1,
            }}
        >
            <FavoriteBorderIcon />
        </button>
    );
};
