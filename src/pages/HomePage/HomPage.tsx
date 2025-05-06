import './styles.css';
import { BasketBtn, FavoriteBtn, ModalWindow } from '../../components';
import { useState, useEffect } from 'react';
import { useSnapCarousel } from 'react-snap-carousel';
import { NavLink } from 'react-router-dom';
import { Box, Container } from '@mui/material';

interface Guitar {
  _id: string;
  img: string;
  name: string;
  cost: number;
  amount: number;
  new?: boolean;
  brand: string; // Добавляем поле brand
  type: string; // Добавляем поле type
  description: string; // Добавляем поле description
}

interface GuitarComponentProps {
  guitar: Guitar;
}

// Типизация функции getRandomItems
const getRandomItems = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random()); // Перемешиваем массив
  return shuffled.slice(0, count); // Берем первые `count` элементов
};

export const HomePage = () => {
  const [guitars, setGuitars] = useState<Guitar[]>([]);
  const [randomGuitars, setRandomGuitars] = useState<Guitar[]>([]); // Новое состояние для случайных гитар
  const err: string = 'Нет в наличии';
  const unerr: string = '';

  // Загружаем данные с сервера
  useEffect(() => {
    fetch('http://localhost:8080/guitars')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        return res.json();
      })
      .then((data: Guitar[]) => setGuitars(data))
      .catch((error: unknown) => console.error(error));
  }, []);

  // Выбираем случайные гитары только при изменении guitars
  useEffect(() => {
    if (guitars.length > 0) {
      const selectedGuitars = getRandomItems(guitars, 15);
      setRandomGuitars(selectedGuitars);
    }
  }, [guitars]); // Зависимость только от guitars

  const {
    scrollRef: randomGuitarsScrollRef,
    pages: randomGuitarsPages,
    activePageIndex: randomGuitarsActivePageIndex,
    next: randomGuitarsNext,
    prev: randomGuitarsPrev,
    goTo: randomGuitarsGoTo,
  } = useSnapCarousel();

  return (
    <>
      <Container maxWidth="xl">
        <div className="Main">
          <div className="sliders">
            <div className="slider">
              <nav className="slider-title">Подборка товаров</nav>
              <div className="category-slider">
                <button className="slider-tick" onClick={() => randomGuitarsPrev()}>
                  ‹
                </button>
                <ul
                  ref={randomGuitarsScrollRef} // Передаём scrollRef напрямую
                  style={{
                    display: 'flex',
                    overflow: 'auto',
                    scrollSnapType: 'x mandatory',
                  }}
                >
                  {randomGuitars.map((guitar) => (
                    <div key={guitar._id} className="guitar">
                      <img
                        src={`/items_pictures/${guitar.img}.png`} // Прямой путь к изображению
                        alt={guitar.name}
                      />
                      <nav>
                        <b>{guitar.name}</b>
                      </nav>
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
                <button className="slider-tick" onClick={() => randomGuitarsNext()}>
                  ›
                </button>
              </div>
              <div className="movements">
                <ol style={{ display: 'flex' }}>
                  {randomGuitarsPages.map((_, i) => (
                    <button
                      key={i}
                      className="slider-button"
                      style={
                        i === randomGuitarsActivePageIndex
                          ? { backgroundColor: '#909090' }
                          : {}
                      }
                      onClick={() => randomGuitarsGoTo(i)}
                    ></button>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="blocks-links">
          <label>
            <div className="block-link" id="electric">
              <NavLink to="/электрогитары">
                <a>Электрогитары</a>
              </NavLink>
            </div>
          </label>
          <label>
            <div className="block-link" id="acustic">
              <NavLink to="/акустические_гитары">
                <a>Акустические гитары</a>
              </NavLink>
            </div>
          </label>
          <label>
            <div className="block-link" id="classic">
              <NavLink to="/классические_гитары">
                <a>Классические гитары</a>
              </NavLink>
            </div>
          </label>
          <label>
            <div className="block-link" id="bass">
              <NavLink to="/басс-гитары">
                <a>Басс-гитары</a>
              </NavLink>
            </div>
          </label>
          <label>
            <div className="block-link" id="combo">
              <NavLink to="/усилители">
                <a>Усилители</a>
              </NavLink>
            </div>
          </label>
          <label>
            <div className="block-link" id="acessuary">
              <NavLink to="/аксессуары">
                <a>Аксессуары</a>
              </NavLink>
            </div>
          </label>
        </div>

        <Box className="kakhochesh" sx={{textAlign: 'center'}}>
          <div className="text">
            <span className="header"> У нас </span>
            <span className="header1"> лучшие бренды</span>
          </div>
          <img src="/icons/companies.png" alt="Companies" />
        </Box>
      </Container>
      <div className="kaktotak">
          <div className="Rhytm">
            <span className="text1"> Почему </span>
            <span className="text2"> Guitar.kz? </span>
          </div>
          <div className="imgcomp">
            <div className="imgcomp1">
              <img src="/icons/comp1.png" alt="Smooth Browsing" />
              <span> Плавный просмотр </span>
              <label> Приятный, простой и удобный дизайн, который легко поможет вам найти то, что нужно. </label>
            </div>
            <div className="imgcomp1">
              <img src="/icons/comp2.png" alt="Simple Delivery" />
              <span> ПРОСТАЯ доставка </span>
              <label> Достаточно просто ввести свой адрес. </label>
            </div>
            <div className="imgcomp1">
              <img src="/icons/comp3.png" alt="Convenient Payments" />
              <span> Удобные ПЛАТЕЖИ </span>
              <label> Надёжные платежи со 100% гарантией. </label>
            </div>
          </div>
        </div>
    </>
  );
};