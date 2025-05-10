import '../styles.css';
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

// Тип для пропсов компонента
interface BasketBtnProps {
  guitar: Guitar;
}

export const BasketBtn = ({ guitar }: BasketBtnProps) => {
  const isOutOfStock = guitar.amount === 0; // Проверяем, есть ли товар в наличии

  const addBasket = async () => {
    if (isOutOfStock) {
      alert('Товара нет в наличии');
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
      disabled={isOutOfStock} // Отключаем кнопку, если товара нет в наличии
      style={{
        cursor: isOutOfStock ? 'not-allowed' : 'pointer', // Меняем курсор
        opacity: isOutOfStock ? 0.5 : 1, // Делаем кнопку полупрозрачной, если неактивна
      }}
    >
      <AddShoppingCartIcon />
    </button>
  );
};