import './styles.css';
import { useState, useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';

// Тип для объекта в корзине
interface BasketItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarCount: number;
  guitarAmount: number; // Максимальное количество, доступное для покупки
}

export const Basket = () => {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [count, setCount] = useState<{ [key: string]: number }>({});
  const [sum, setSum] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('access_token'); // Исправляем ключ
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Пожалуйста, войдите в систему.');
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:8080/basket', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse<BasketItem[]>) => {
        const data = response.data;
        setBasket(data);
        setSum(data.reduce((total, guitar) => total + guitar.guitarCost * guitar.guitarCount, 0));
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при загрузке корзины:', error);
        if (error.response?.status === 401) {
          setError('Невалидный токен. Пожалуйста, войдите снова.');
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Корзина не найдена.');
        } else {
          setError('Произошла ошибка при загрузке корзины.');
        }
      });
  }, [navigate, token]);

  const countPlus = (guitarId: string) => {
    const guitar = basket.find((guitar) => guitar.guitarId === guitarId);
    if (!guitar) return;

    if ((count[guitarId] || guitar.guitarCount) < guitar.guitarAmount) {
      const newCount = (count[guitarId] || guitar.guitarCount) + 1;
      setCount({ ...count, [guitarId]: newCount });
      setSum(sum + guitar.guitarCost);
      axios
        .put(
          `http://localhost:8080/basket/${guitarId}`,
          { action: 'plus' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response: AxiosResponse) => {
          console.log(response.data);
          // Обновляем корзину без перезагрузки страницы
          axios
            .get('http://localhost:8080/basket', {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response: AxiosResponse<BasketItem[]>) => {
              setBasket(response.data);
              setSum(
                response.data.reduce((total, guitar) => total + guitar.guitarCost * guitar.guitarCount, 0)
              );
            });
        })
        .catch((error: AxiosError) => {
          console.error('Ошибка при увеличении количества:', error);
          setError('Ошибка при увеличении количества товара.');
        });
    }
  };

  const countMinus = (guitarId: string) => {
    const guitar = basket.find((guitar) => guitar.guitarId === guitarId);
    if (!guitar) return;

    const currentCount = count[guitarId] || guitar.guitarCount;
    if (currentCount > 1) {
      const newCount = currentCount - 1;
      setCount({ ...count, [guitarId]: newCount });
      setSum(sum - guitar.guitarCost);
      axios
        .put(
          `http://localhost:8080/basket/${guitarId}`,
          { action: 'minus' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response: AxiosResponse) => {
          console.log(response.data);
          // Обновляем корзину без перезагрузки страницы
          axios
            .get('http://localhost:8080/basket', {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response: AxiosResponse<BasketItem[]>) => {
              setBasket(response.data);
              setSum(
                response.data.reduce((total, guitar) => total + guitar.guitarCost * guitar.guitarCount, 0)
              );
            });
        })
        .catch((error: AxiosError) => {
          console.error('Ошибка при уменьшении количества:', error);
          setError('Ошибка при уменьшении количества товара.');
        });
    }
  };

  const removeBasket = (guitarId: string) => {
    axios({
      method: 'POST',
      url: 'http://localhost:8080/basket/delete',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-HTTP-Method-Override': 'DELETE',
      },
      data: { guitarId: guitarId },
    })
      .then((response: AxiosResponse) => {
        setBasket(basket.filter((guitar) => guitar.guitarId !== guitarId));
        setSum(basket.reduce((total, guitar) => total + guitar.guitarCost * guitar.guitarCount, 0));
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при удалении товара из корзины:', error);
        setError('Ошибка при удалении товара из корзины.');
      });
  };

  const removeAll = () => {
    axios
      .patch('http://localhost:8080/basket/delete', null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setBasket([]);
        setSum(0);
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при удалении всех товаров из корзины:', error);
        setError('Ошибка при удалении всех товаров из корзины.');
      });
  };

  const goToPay = () => {
    navigate('/оплата');
  };

  return (
    <div className="Basket">
      <h2 className="Basket-title">КОРЗИНА</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {basket.length === 0 && !error ? (
        <div>Корзина пуста</div>
      ) : (
        <>
          <button className="deleteAll" onClick={removeAll}>
            Удалить всё
          </button>
          {basket.map((guitar) => (
            <div key={guitar.guitarId} className="guitarBasket">
              <img
                className="basketImg"
                src={`/items_pictures/${guitar.guitarImg}.png`}
                alt={guitar.guitarName}
              />
              <h3>{guitar.guitarName}</h3>
              <button onClick={() => countPlus(guitar.guitarId)} className="changeCount">
                +
              </button>
              <nav className="count">{count[guitar.guitarId] || guitar.guitarCount}шт</nav>
              <button onClick={() => countMinus(guitar.guitarId)} className="changeCount">
                -
              </button>
              <span>{guitar.guitarCost}тг</span>
              <button
                id="deleteBtn"
                className="favoriteBtn"
                style={{ width: '30px', height: '30px' }}
                onClick={() => removeBasket(guitar.guitarId)}
              >
                <DeleteIcon sx={{ width: '30px', height: '30px' }} />
              </button>
            </div>
          ))}
          <div className="basket-end">
            <nav>
              Итого: <span>{sum}тг</span>
            </nav>
            <button onClick={goToPay}>Купить</button>
          </div>
        </>
      )}
    </div>
  );
};