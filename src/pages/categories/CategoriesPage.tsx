import './styles.css';
import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography } from '@mui/material';
import { theme } from '../../theme';
import { handleImageError } from '../../utils';
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

export const CategoriesPage = () => {
  const { category } = useParams<{ category: string }>();
  const [guitars, setGuitars] = useState<Guitar[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'ascending' | 'descending'>('default');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const categoryTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Категория';

  useEffect(() => {
    const fetchGuitars = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/guitars');
        setGuitars(response.data || []);
      } catch (err) {
        setError('Не удалось загрузить товары.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuitars();
  }, []);

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as 'default' | 'ascending' | 'descending');
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const sortAndFilterGuitars = (guitars: Guitar[]): Guitar[] => {
    let filteredGuitars = guitars.filter((guitar) => guitar.type.toLowerCase() === category?.toLowerCase());

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

  const sortedAndFilteredGuitars = sortAndFilterGuitars(guitars);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="Page">
      <h2>{categoryTitle}</h2>
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
        {sortedAndFilteredGuitars.map((guitar) => (
          <div key={guitar._id} className="guitar">
            <img
              src={guitar.img}
              alt={guitar.name}
              onError={handleImageError}
            />
            <nav>
              <b>{guitar.name}</b>
            </nav>
            <Typography sx={{ color: theme.palette.primary.main }}>{guitar.seller.login}</Typography>
            <span>{guitar.cost}тг</span>
            <span className="errAmount">{guitar.amount === 0 ? 'Нет в наличии' : ''}</span>
            <div className="buttons">
              <BasketBtn guitar={guitar} />
              <FavoriteBtn guitar={guitar} />
              <ModalWindow guitar={guitar} />
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
};