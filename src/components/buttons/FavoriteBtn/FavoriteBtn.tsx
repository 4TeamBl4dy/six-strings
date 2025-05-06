import '../styles.css'
import axios, { AxiosResponse, AxiosError } from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// Тип для объекта гитары
interface Guitar {
  _id: string;
  img: string;
  name: string;
  amount: number;
  cost: number;
}

// Тип для пропсов компонента
interface FavoriteBtnProps {
  guitar: Guitar;
}

export const FavoriteBtn = ({ guitar }: FavoriteBtnProps) => {
  const addFavorite = async () => {
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
      console.log('Товар успешно добавлен в корзину');
      alert('Товар успешно добавлен в корзину');
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError);
      alert('Ошибка при добавлении товара в корзину');
    }
  };

  return (
    <button className="favoriteBtn" onClick={addFavorite}>
      <FavoriteBorderIcon />
    </button>
  );
}