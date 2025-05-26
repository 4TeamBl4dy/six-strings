import { useState, useEffect } from 'react';
import '../styles.css';
import axios, { AxiosResponse, AxiosError } from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useToast } from 'src/components';
import { FavoriteItem, Guitar } from 'src/types';

// Тип для пропсов компонента
interface FavoriteBtnProps {
  guitar: Guitar;
}

export const FavoriteBtn = ({ guitar }: FavoriteBtnProps) => {
  const [isInFavorites, setIsInFavorites] = useState<boolean>(false); // Состояние для отслеживания наличия в избранном
  const { showToast } = useToast();

  // Получаем данные избранного при монтировании компонента
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response: AxiosResponse<FavoriteItem[]> = await axios.get('http://localhost:8080/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favoriteItems = response.data || [];
        const isAlreadyInFavorites = favoriteItems.some((item) => item.guitarId === guitar._id);
        setIsInFavorites(isAlreadyInFavorites);
      } catch (error) {
        console.error('Ошибка при загрузке избранного:', error);
      }
    };

    fetchFavorites();
  }, [guitar._id]);

  const addFavorite = async () => {
    if (isInFavorites) {
      showToast('Этот товар уже есть в вашем избранном', 'info');
      return;
    }

    const token = localStorage.getItem('access_token');

    try {
      const response: AxiosResponse = await axios.post(
        'http://localhost:8080/favorites',
        {
          guitarId: guitar._id,
          guitarImg: guitar.img,
          guitarName: guitar.name,
          guitarAmount: guitar.amount,
          guitarCost: guitar.cost,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Товар успешно добавлен в избранное');
      showToast('Товар успешно добавлен в избранное', 'success');
      setIsInFavorites(true); // Обновляем состояние после успешного добавления
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError);
      showToast('Ошибка при добавлении товара в избранное', 'error');
    }
  };

  return (
    <button
      className="favoriteBtn"
      onClick={addFavorite}
      disabled={isInFavorites} // Отключаем кнопку, если товар уже в избранном
      style={{
        cursor: isInFavorites ? 'not-allowed' : 'pointer',
        opacity: isInFavorites ? 0.5 : 1,
      }}
    >
      <FavoriteBorderIcon />
    </button>
  );
};