import '../styles.css';
import {useState, useEffect} from 'react'
import axios, { AxiosResponse, AxiosError } from 'axios';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// Тип для объекта гитары
interface Guitar {
  _id: string;
  img: string;
  name: string;
  amount: number;
  cost: number;
}

// Тип для элемента корзины
interface BasketItem {
  _id: string;
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarAmount: number;
  guitarCost: number;
}

// Тип для пропсов компонента
interface BasketBtnProps {
  guitar: Guitar;
}

export const BasketBtn = ({ guitar }: BasketBtnProps) => {
  const isOutOfStock = guitar.amount === 0; // Проверяем, есть ли товар в наличии
  const [isInBasket, setIsInBasket] = useState<boolean>(false); // Состояние для отслеживания наличия в корзине

  // Получаем данные корзины при монтировании компонента
  useEffect(() => {
    const fetchBasket = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response: AxiosResponse<BasketItem[]> = await axios.get('http://localhost:8080/basket', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const basketItems = response.data || [];
        const isAlreadyInBasket = basketItems.some((item) => item.guitarId === guitar._id);
        setIsInBasket(isAlreadyInBasket);
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
      }
    };

    fetchBasket();
  }, [guitar._id]);

  const addBasket = async () => {
    if (isOutOfStock) {
      alert('Товара нет в наличии');
      return;
    }

    if (isInBasket) {
      alert('Этот товар уже есть в вашей корзине');
      return;
    }

    const token = localStorage.getItem('access_token');

    try {
      const response: AxiosResponse = await axios.post(
        'http://localhost:8080/basket',
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
      setIsInBasket(true); // Обновляем состояние после успешного добавления
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError);
      alert('Ошибка при добавлении товара в корзину');
    }
  };

  return (
    <button
      className="basketBtn"
      onClick={addBasket}
      disabled={isOutOfStock || isInBasket} // Отключаем кнопку, если товара нет в наличии или он уже в корзине
      style={{
        cursor: isOutOfStock || isInBasket ? 'not-allowed' : 'pointer',
        opacity: isOutOfStock || isInBasket ? 0.5 : 1,
      }}
    >
      <AddShoppingCartIcon />
    </button>
  );
};