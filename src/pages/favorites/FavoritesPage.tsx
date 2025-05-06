import './styles.css';
import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import {theme} from '../../theme'

// Тип для объекта в избранном
interface FavoriteItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarAmount: number;
  seller: {
    login: string;
    name: string;
    phone: string;
  };
}

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('access_token'); // Исправляем ключ
  const navigate = useNavigate();

  const fetchFavorites = useCallback(() => {
    if (!token) {
      setError('Пожалуйста, войдите в систему.');
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:8080/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse<FavoriteItem[]>) => {
        setFavorites(response.data || []);
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при загрузке избранного:', error);
        if (error.response?.status === 401) {
          setError('Невалидный токен. Пожалуйста, войдите снова.');
          navigate('/login');
        } else if (error.response?.status === 404) {
          setError('Избранное не найдено.');
        } else {
          setError('Произошла ошибка при загрузке избранного.');
        }
      });
  }, [token, navigate]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addCart = useCallback(
    (guitarId: string, guitarImg: string, guitarName: string, guitarCost: number, guitarAmount: number) => {
      axios
        .post(
          'http://localhost:8080/basket',
          {
            guitarId,
            guitarImg,
            guitarName,
            guitarCost,
            guitarAmount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response: AxiosResponse) => {
          console.log('Товар успешно добавлен в корзину:', response.data);
        })
        .catch((error: AxiosError) => {
          console.error('Ошибка при добавлении в корзину:', error);
          setError('Ошибка при добавлении товара в корзину.');
        });
    },
    [token]
  );

  const removeFavorite = (guitarId: string) => {
    axios({
      method: 'POST',
      url: 'http://localhost:8080/favorites/delete',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-HTTP-Method-Override': 'DELETE',
      },
      data: { guitarId: guitarId },
    })
      .then((response: AxiosResponse) => {
        setFavorites(favorites.filter((guitar) => guitar.guitarId !== guitarId));
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при удалении товара из избранного:', error);
        setError('Ошибка при удалении товара из избранного.');
      });
  };

  const removeAll = () => {
    axios
      .patch('http://localhost:8080/favorites/delete', null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setFavorites([]);
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при удалении всех товаров из избранного:', error);
        setError('Ошибка при удалении всех товаров из избранного.');
      });
  };

  return (
    <div className="Favorites">
      <h2>ИЗБРАННОЕ</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {favorites.length === 0 && !error ? (
        <div>Избранное пусто</div>
      ) : (
        <>
          <button className="deleteAll" onClick={removeAll}>
            Удалить всё
          </button>
          <div className="favoritesList">
            {favorites.map((guitar) => (
              <div key={guitar.guitarId} className="guitar">
                <img src={`/items_pictures/${guitar.guitarImg}.png`} alt={guitar.guitarName} />
                <nav>
                  <b>{guitar.guitarName}</b>
                </nav>
                <Typography sx={{color: theme.palette.primary.main}}>{guitar.seller.login}</Typography>
                <span>{guitar.guitarCost}тг</span>
                <div className="buttons">
                  <button
                    className="basketBtn"
                    onClick={() =>
                      addCart(
                        guitar.guitarId,
                        guitar.guitarImg,
                        guitar.guitarName,
                        guitar.guitarCost,
                        guitar.guitarAmount
                      )
                    }
                  >
                    <AddShoppingCartIcon />
                  </button>
                  <button
                    className="favoriteBtn"
                    style={{ width: '35px', height: '35px' }}
                    onClick={() => removeFavorite(guitar.guitarId)}
                  >
                    <DeleteIcon sx={{ width: '35px', height: '35px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}