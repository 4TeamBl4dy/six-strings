import { useState, useEffect } from 'react';
import { Typography, Grid, Box, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  StyledContainer,
  ToolbarWrapper,
  ProductsGrid,
  GuitarCard,
  GuitarCardMedia,
  GuitarCardContent,
} from './styles';
import { BasketBtn, FavoriteBtn, ModalWindow, CustomTextField, CustomSelect, Title } from 'src/components';
import { theme } from 'src/theme';
import { ROUTES } from 'src/constants';
import { Loader } from 'src/components';
import { Guitar } from '../../types/product';
import { AppDispatch, RootState } from 'src/storage/store';
import { fetchProducts } from 'src/storage/features/productSlice';

export const CatalogPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: guitars, loading, error } = useSelector((state: RootState) => state.products);

  // Local state for UI filtering/sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string[]>([]);

  const err = 'Нет в наличии';

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categories = [
    { value: 'electric', label: 'Электрические гитары' },
    { value: 'acoustic', label: 'Акустические гитары' },
    { value: 'classic', label: 'Классические гитары' },
    { value: 'bass', label: 'Бас-гитары' },
    { value: 'combo', label: 'Комбоусилители' },
    { value: 'accessories', label: 'Аксессуары' },
  ];

  const uniqueTypes = Array.from(new Set(guitars.map((g) => g.type))).map((value) => ({
    value,
    label: categories.find((cat) => cat.value === value)?.label || value,
  }));
  const uniqueBrands = Array.from(new Set(guitars.map((g) => g.brand || ''))).map((brand) => ({
    value: brand,
    label: brand,
  }));

  const sortAndFilterGuitars = (guitars: Guitar[]): Guitar[] => {
    let filteredGuitars = guitars;

    if (searchTerm) {
      filteredGuitars = filteredGuitars.filter((guitar) =>
        guitar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guitar.seller.login.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filteredGuitars = filteredGuitars.filter((guitar) =>
      filterTypes.length ? filterTypes.includes(guitar.type) : true
    );

    filteredGuitars = filteredGuitars.filter((guitar) =>
      filterBrands.length && guitar.brand ? filterBrands.includes(guitar.brand) : true
    );

    return filteredGuitars.sort((a, b) => {
      for (const sort of sortBy) {
        switch (sort) {
          case 'nameAsc':
            return a.name.localeCompare(b.name);
          case 'nameDesc':
            return b.name.localeCompare(a.name);
          case 'priceAsc':
            return a.cost - b.cost;
          case 'priceDesc':
            return b.cost - a.cost;
        }
      }
      return 0;
    });
  };

  const sortedAndFilteredGuitars = guitars ? sortAndFilterGuitars(guitars) : [];

  // Updated loading and error handling
  if (loading === 'pending') {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }

  if (loading === 'failed' && error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</div>;
  }
  
  // Handle the case where loading is 'idle' and no products have been fetched yet, 
  // or if loading is 'succeeded' but items array is empty (though sortAndFilterGuitars handles empty guitars).
  // This specific check might be redundant if sortedAndFilteredGuitars handles it well.
  // if (loading !== 'pending' && loading !== 'failed' && guitars.length === 0 && !error) {
  //   return <div style={{ textAlign: 'center', marginTop: '20px' }}>Каталог пуст или товары не загружены.</div>;
  // }


  return (
    <StyledContainer maxWidth="xl">
      <Title size={'h4'} text={'Каталог'} />
      <ToolbarWrapper>
        <CustomTextField
          sx={{ width: 220 }}
          label="Поиск по названию или логину продавца"
          value={searchTerm}
          onChange={(value: string) => setSearchTerm(value)}
        />
        <CustomSelect
          sx={{ width: 220 }}
          label="Фильтр по типам"
          value={filterTypes}
          onChange={(value: string | string[]) => setFilterTypes(value as string[])}
          options={categories}
          multiple
        />
        <CustomSelect
          sx={{ width: 220 }}
          label="Фильтр по брендам"
          value={filterBrands}
          onChange={(value: string | string[]) => setFilterBrands(value as string[])}
          options={uniqueBrands}
          multiple
        />
        <CustomSelect
          sx={{ width: 220 }}
          label="Сортировка"
          value={sortBy}
          onChange={(value: string | string[]) => setSortBy(value as string[])}
          options={[
            { value: 'nameAsc', label: 'Название (А-Я)' },
            { value: 'nameDesc', label: 'Название (Я-А)' },
            { value: 'priceAsc', label: 'Цена (возрастание)' },
            { value: 'priceDesc', label: 'Цена (убывание)' },
          ]}
          multiple
        />
      </ToolbarWrapper>
      <ProductsGrid container>
        {sortedAndFilteredGuitars.length === 0 ? (
          <div>Товары не найдены</div>
        ) : (
          sortedAndFilteredGuitars.map((guitar) => (
            <Grid item key={guitar._id} xs={12} sm={6} md={4} lg={3}>
              <GuitarCard>
                <GuitarCardMedia image={guitar.img} />
                <GuitarCardContent>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {guitar.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={theme.palette.primary.main}
                      component={Link}
                      to={`${ROUTES.SALER_PRODUCTS}?seller=${guitar.seller.login}`} 
                      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {guitar.seller.login}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {guitar.cost}₸
                    </Typography>
                    {guitar.amount === 0 && (
                      <Typography variant="body2" color="error.main">
                        {err}
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" mt={1}>
                    <BasketBtn guitar={guitar} />
                    <FavoriteBtn guitar={guitar} />
                    <ModalWindow guitar={guitar} />
                  </Box>
                </GuitarCardContent>
              </GuitarCard>
            </Grid>
          ))
        )}
      </ProductsGrid>
    </StyledContainer>
  );
};