import { useState, useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { handleImageError } from 'src/utils';
import {BasketContainer, BasketTitle, DeleteAllButton, GuitarItem, GuitarImage, CountButton, CountText, DeleteButton, BasketFooter, BuyButton, GuitarName } from './styles'
import {
  Box,
  Typography,
  Container
} from '@mui/material';
import { PaymentModalWrapper, Loader } from 'src/components';

interface BasketItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarCount: number;
  guitarAmount: number;
}

export const Basket = () => {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [count, setCount] = useState<{ [key: string]: number }>({});
  const [sum, setSum] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const token = localStorage.getItem('access_token');
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
        setLoading(true)
        const data = response.data;
        setBasket(data);
        setSum(data.reduce((total, guitar) => total + guitar.guitarCost * guitar.guitarCount, 0));
        setLoading(false)
      })
      .catch((error: AxiosError) => {
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

  const updateBasket = () => {
    axios
      .get('http://localhost:8080/basket', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse<BasketItem[]>) => {
        setBasket(response.data);
        setSum(response.data.reduce((total, guitar) => total + guitar.guitarCost * guitar.guitarCount, 0));
      });
  };

  const countPlus = (guitarId: string) => {
    const guitar = basket.find((g) => g.guitarId === guitarId);
    if (!guitar) return;

    if ((count[guitarId] || guitar.guitarCount) < guitar.guitarAmount) {
      setCount({ ...count, [guitarId]: (count[guitarId] || guitar.guitarCount) + 1 });
      setSum(sum + guitar.guitarCost);

      axios
        .put(`http://localhost:8080/basket/${guitarId}`, { action: 'plus' }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(updateBasket)
        .catch(() => setError('Ошибка при увеличении количества товара.'));
    }
  };

  const countMinus = (guitarId: string) => {
    const guitar = basket.find((g) => g.guitarId === guitarId);
    if (!guitar) return;

    const currentCount = count[guitarId] || guitar.guitarCount;
    if (currentCount > 1) {
      setCount({ ...count, [guitarId]: currentCount - 1 });
      setSum(sum - guitar.guitarCost);

      axios
        .put(`http://localhost:8080/basket/${guitarId}`, { action: 'minus' }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(updateBasket)
        .catch(() => setError('Ошибка при уменьшении количества товара.'));
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
      data: { guitarId },
    })
      .then(updateBasket)
      .catch(() => setError('Ошибка при удалении товара из корзины.'));
  };

  const removeAll = () => {
    axios
      .patch('http://localhost:8080/basket/delete', null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setBasket([]);
        setSum(0);
      })
      .catch(() => setError('Ошибка при удалении всех товаров из корзины.'));
  };

  const [openPayment, setOpenPayment] = useState(false);

  const handlePaymentSuccess = async () => {
    try {
      await axios.post('http://localhost:8080/basket/confirm', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch {
      setError('Ошибка при подтверждении покупки');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }

  return (
    <BasketContainer>
      <BasketTitle variant="h4">КОРЗИНА</BasketTitle>
      {error && <Typography color="error">{error}</Typography>}
      {basket.length === 0 && !error ? (
        <Typography>Корзина пуста</Typography>
      ) : (
        <>
          <DeleteAllButton onClick={removeAll}>Удалить всё</DeleteAllButton>
          {basket.map((guitar) => (
            <GuitarItem key={guitar.guitarId}>
              <GuitarImage src={guitar.guitarImg} alt={guitar.guitarName} onError={handleImageError} />
              <GuitarName variant="h6">{guitar.guitarName}</GuitarName>
              <Box display="flex" alignItems="center">
                <CountButton onClick={() => countPlus(guitar.guitarId)}>+</CountButton>
                <CountText>{count[guitar.guitarId] || guitar.guitarCount} шт</CountText>
                <CountButton onClick={() => countMinus(guitar.guitarId)}>-</CountButton>
              </Box>
              <Typography>{guitar.guitarCost} ₸</Typography>
              <DeleteButton onClick={() => removeBasket(guitar.guitarId)}>
                <DeleteIcon sx={{ width: 30, height: 30 }} />
              </DeleteButton>
            </GuitarItem>
          ))}
          <BasketFooter>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              Итого: <strong>{sum} ₸</strong>
            </Typography>
            <BuyButton onClick={() => setOpenPayment(true)}>Купить</BuyButton>
            <PaymentModalWrapper
              open={openPayment}
              onClose={() => setOpenPayment(false)}
              amount={sum}
              onSuccess={handlePaymentSuccess}
            />
          </BasketFooter>
        </>
      )}
    </BasketContainer>
  );
};
