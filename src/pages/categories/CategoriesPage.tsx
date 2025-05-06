import './styles.css';
import { useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import {theme} from '../../theme'

import {BasketBtn, FavoriteBtn, ModalWindow } from '../../components';

// Тип для объекта гитары
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

// Тип для пропсов компонента
interface PagesProps {
  guitars: Guitar[];
}

export const CategoriesPage = ({ guitars }: PagesProps) => {
  const { category } = useParams<{ category: string }>(); // Типизация useParams
  const decodedCategory = decodeURIComponent(category?.replace(/-/g, '') || '');
  const categoryTitle = decodeURIComponent(category?.replace(/-/g, '') || '').replace(/_/g, ' ');
  const [sortBy, setSortBy] = useState<'default' | 'ascending' | 'descending'>('default'); // Типизация состояния
  const [searchTerm, setSearchTerm] = useState<string>('');

  const err: string = 'Нет в наличии';
  const unerr: string = '';

  // Типизация события для select
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as 'default' | 'ascending' | 'descending');
  };

  // Типизация события для input
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const sortAndFilterGuitars = (guitars: Guitar[]): Guitar[] => {
    let filteredGuitars = guitars.filter((guitar) => guitar.type === decodedCategory);

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
              src={`/items_pictures/${guitar.img}.png`} // Прямой путь к изображению
              alt={guitar.name}
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
        ))}
      </ul>
    </div>
  );
};