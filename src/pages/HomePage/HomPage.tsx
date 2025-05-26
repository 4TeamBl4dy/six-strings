import { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BasketBtn, FavoriteBtn, ModalWindow, Loader } from 'src/components';
import { handleImageError } from 'src/utils';
import {
  StyledContainer,
  SliderSection,
  SliderTitle,
  SliderWrapper,
  SliderButton,
  CarouselContainer,
  GuitarCard,
  GuitarCardMedia,
  GuitarCardContent,
  PaginationWrapper,
  PaginationButton,
  ActivePaginationButton,
  CategorySection,
  CategoryCard,
  CategoryGridItem,
  BrandsSection,
  BrandsTitle,
  BrandsImage,
  FooterSection,
  FooterTitleWrapper,
  FooterGrid,
  FooterItem,
  FooterImage,
  FooterSubtitle,
  FooterDescription,
} from './styles';
import { Typography, Box, Grid, Container } from '@mui/material';
import {ROUTES} from 'src/constants'
import { Guitar } from 'src/types';

export const HomePage = () => {
  const [guitars, setGuitars] = useState<Guitar[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Загрузка данных о популярных гитарах с сервера
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/guitars/popular')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        return res.json();
      })
      .then((data: Guitar[]) => {
        setGuitars(data); // Уже отсортированные по популярности
        setLoading(false);
      })
      .catch((error: unknown) => console.error(error));
  }, []);

  // Расчёт количества карточек на страницу (максимум 5) и общего числа страниц
  useEffect(() => {
    const updateCarousel = () => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.offsetWidth;
        const cardWidth = 200 + 16; // maxWidth (200px) + margin (2 * 8px)
        const newCardsPerPage = Math.max(1, Math.min(5, Math.floor(containerWidth / cardWidth)));
        setCardsPerPage(newCardsPerPage);
        setTotalPages(Math.ceil(guitars.length / newCardsPerPage));
        setActivePage((prev) => Math.min(prev, Math.ceil(guitars.length / newCardsPerPage) - 1));
        if (activePage === 0 && carouselRef.current) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    };

    updateCarousel();
    window.addEventListener('resize', updateCarousel);
    return () => window.removeEventListener('resize', updateCarousel);
  }, [guitars.length, activePage]);

  // Функция для прокрутки к предыдущей странице
  const handlePrev = () => {
    if (activePage > 0) {
      const newPage = activePage - 1;
      setActivePage(newPage);
      if (carouselRef.current) {
        const cardWidth = 200 + 16;
        const scrollPosition = newPage * cardsPerPage * cardWidth;
        carouselRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  };

  // Функция для прокрутки к следующей странице
  const handleNext = () => {
    if (activePage < totalPages - 1) {
      const newPage = activePage + 1;
      setActivePage(newPage);
      if (carouselRef.current) {
        const cardWidth = 200 + 16;
        const scrollPosition = newPage * cardsPerPage * cardWidth;
        carouselRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  };

  // Функция для перехода к конкретной странице
  const goToPage = (page: number) => {
    setActivePage(page);
    if (carouselRef.current) {
      const cardWidth = 200 + 16;
      const scrollPosition = page * cardsPerPage * cardWidth;
      carouselRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
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
    <StyledContainer maxWidth="xl">
      {/* Секция слайдера товаров */}
      <SliderSection>
        <SliderTitle variant="h6">Популярные товары</SliderTitle>
        <SliderWrapper>
          {/* Кнопка "Назад" */}
          <SliderButton onClick={handlePrev} disabled={activePage === 0}>
            ‹
          </SliderButton>
          {/* Контейнер слайдера */}
          <CarouselContainer cardCount={guitars.length} ref={carouselRef}>
            {guitars.map((guitar) => (
              <GuitarCard key={guitar._id}>
                <GuitarCardMedia image={guitar.img} onError={handleImageError} />
                <GuitarCardContent>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {guitar.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="primary.main"
                    component={Link}
                    to={`${ROUTES.SALER_PRODUCTS}?seller=${guitar.seller.login}`} 
                  >
                    {guitar.seller.login}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {guitar.cost}₸
                  </Typography>
                  {guitar.amount === 0 && (
                    <Typography variant="body2" color="error.main">
                      Нет в наличии
                    </Typography>
                  )}
                  <Box display="flex" mt={1}>
                    <BasketBtn guitar={guitar} />
                    <FavoriteBtn guitar={guitar} />
                    <ModalWindow guitar={guitar} />
                  </Box>
                </GuitarCardContent>
              </GuitarCard>
            ))}
          </CarouselContainer>
          {/* Кнопка "Вперёд" */}
          <SliderButton onClick={handleNext} disabled={activePage >= totalPages - 1}>
            ›
          </SliderButton>
        </SliderWrapper>
        {/* Пагинация */}
        <PaginationWrapper>
          {totalPages > 1 &&
            Array.from({ length: totalPages }).map((_, i) => (
              i === activePage ? (
                <ActivePaginationButton key={i} onClick={() => goToPage(i)} />
              ) : (
                <PaginationButton key={i} onClick={() => goToPage(i)} />
              )
            ))}
        </PaginationWrapper>
      </SliderSection>

      {/* Секция категорий */}
      <CategorySection container spacing={3}>
        {[
          { id: 'electric', name: 'Электрогитары', img: '/icons/electric.png' },
          { id: 'acoustic', name: 'Акустические гитары', img: '/icons/acoustic.png' },
          { id: 'classic', name: 'Классические гитары', img: '/icons/classic.png' },
          { id: 'bass', name: 'Басс-гитары', img: '/icons/bass.png' },
          { id: 'combo', name: 'Усилители', img: '/icons/combo.png' },
          { id: 'accessories', name: 'Аксессуары', img: '/icons/accessories.png' },
        ].map((category) => (
          <CategoryGridItem item xs={6} sm={4} md={2} key={category.id}>
            <NavLink to={`/category/${category.id}`} style={{ textDecoration: 'none' }}>
              <CategoryCard sx={{ background: `linear-gradient(180deg, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0.80) 100%), url(${category.img})`, backgroundSize: 'cover' }}>
                <Typography variant="h6">{category.name}</Typography>
              </CategoryCard>
            </NavLink>
          </CategoryGridItem>
        ))}
      </CategorySection>

      {/* Секция брендов */}
      <BrandsSection>
        <BrandsTitle variant="h5">У нас</BrandsTitle>
        <BrandsTitle variant="h5" color="primary.main" sx={{ ml: 1 }}>
          лучшие бренды
        </BrandsTitle>
        <BrandsImage src="/icons/companies.png" alt="Companies" />
      </BrandsSection>

      {/* Секция "Почему Guitar.kz?" */}
      <FooterSection>
        <FooterTitleWrapper>
          <BrandsTitle variant="h5">Почему</BrandsTitle>
          <BrandsTitle variant="h5" color="primary.main" sx={{ ml: 1 }}>
            Guitar.kz?
          </BrandsTitle>
        </FooterTitleWrapper>
        <FooterGrid container spacing={3}>
          {[
            {
              img: '/icons/comp1.png',
              title: 'Плавный просмотр',
              desc: 'Приятный, простой и удобный дизайн, который легко поможет вам найти то, что нужно.',
            },
            {
              img: '/icons/comp2.png',
              title: 'Простая доставка',
              desc: 'Доставку для вас заказывает продавец через популярные сервисы доставки.',
            },
            {
              img: '/icons/comp3.png',
              title: 'Удобные платежи',
              desc: 'Надёжные платежи со 100% гарантией.',
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <FooterItem>
                <FooterImage src={item.img} alt={item.title} />
                <FooterSubtitle variant="subtitle1">{item.title}</FooterSubtitle>
                <FooterDescription variant="body2">{item.desc}</FooterDescription>
              </FooterItem>
            </Grid>
          ))}
        </FooterGrid>
      </FooterSection>
    </StyledContainer>
  );
};