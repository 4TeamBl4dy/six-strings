import './styles.css';
import { useState, ChangeEvent, useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Typography } from '@mui/material';
import {theme} from '../../theme'
import {handleImageError} from '../../utils'

import { BasketBtn, FavoriteBtn, ModalWindow } from '../../components';

interface Guitar {
  _id: string;
  img: string;
  name: string;
  cost: number;
  amount: number;
  type: string;
  brand?: string;
  description?: string; 
  seller: {
    login: string;
    name: string;
    phone: string;
  };
}

export const CatalogPage = () => {
  const [guitars, setGuitars] = useState<Guitar[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'ascending' | 'descending'>('default');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const err: string = 'Нет в наличии';
  const unerr: string = '';

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:8080/guitars')
      .then((response: AxiosResponse<Guitar[]>) => {
        setGuitars(response.data || []);
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        console.error('Ошибка при загрузке товаров:', error);
        setError('Не удалось загрузить каталог. Попробуйте позже.');
        setLoading(false);
      });
  }, []);

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as 'default' | 'ascending' | 'descending');
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const sortAndFilterGuitars = (guitars: Guitar[]): Guitar[] => {
    let filteredGuitars = guitars;

    if (searchTerm) {
      filteredGuitars = filteredGuitars.filter((guitar) =>
        guitar.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'ascending':
        return [...filteredGuitars].sort((a, b) => a.cost - b.cost);
      case 'descending':
        return [...filteredGuitars].sort((a, b) => b.cost - a.cost);
      default:
        return filteredGuitars;
    }
  };

  const sortedAndFilteredGuitars = guitars ? sortAndFilterGuitars(guitars) : [];

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="Page">
      <h2>Каталог</h2>
      <div className="sort-cost">
        <label htmlFor="sort">Сортировка по цене:</label>
        <select id="sort" value={sortBy} onChange={handleSortChange}>
          <option value="default">По умолчанию</option>
          <option value="ascending">По возрастанию</option>
          <option value="descending">По убыванию</option>
        </select>
      </div>
      <div className="searchGuitar">
        <label htmlFor="search">Поиск по названию:</label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Введите название"
        />
      </div>
      <ul className="categories">
        {sortedAndFilteredGuitars.length === 0 ? (
          <div>Товары не найдены</div>
        ) : (
          sortedAndFilteredGuitars.map((guitar) => (
            <div key={guitar._id} className="guitar">
              <img 
                src={guitar.img} 
                alt={guitar.name} 
                onError={handleImageError} 
              />
              <nav>
                <b>{guitar.name}</b>
              </nav>
              <Typography sx={{color: theme.palette.primary.main}}>{guitar.seller.login}</Typography>
              <span>{guitar.cost}тг</span>
              <span className="errAmount">{guitar.amount === 0 ? err : unerr}</span>
              <div className="buttons">
                <BasketBtn guitar={guitar} />
                <FavoriteBtn guitar={guitar} />
                <ModalWindow guitar={guitar} />
              </div>
            </div>
          ))
        )}
      </ul>
    </div>
  );
};