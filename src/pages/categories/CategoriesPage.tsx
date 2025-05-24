import { useState, useEffect, ChangeEvent } from 'react'; // ChangeEvent might not be needed if not directly used
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { Typography, Grid, Box, Container } from '@mui/material';
import {
  StyledContainer,
  ToolbarWrapper,
  ProductsGrid,
  GuitarCard,
  GuitarCardMedia,
  GuitarCardContent,
} from './styles';
import { BasketBtn, FavoriteBtn, ModalWindow, CustomTextField, CustomSelect, Title, Loader } from 'src/components';
import {ROUTES} from 'src/constants';
import { Guitar } from '../../types/product';
import { Category as CategoryType } from '../../types/categories'; // Renamed to avoid conflict
import { AppDispatch, RootState } from '../../storage/store';
import { fetchProducts } from '../../storage/features/productSlice';
import { fetchCategories } from '../../storage/features/categoriesSlice';


export const CategoriesPage = () => {
  const { category: categoryParam } = useParams<{ category: string }>(); // category value from URL
  const dispatch = useDispatch<AppDispatch>();

  const { 
    items: allProducts, 
    isLoading: productsLoading, 
    error: productsError 
  } = useSelector((state: RootState) => state.products);
  
  const { 
    items: categoryList, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useSelector((state: RootState) => state.categories);

  // Local state for UI filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string[]>([]);
  
  // Determine the category title dynamically from Redux state if available
  const currentCategory = categoryList.find(c => c.value === categoryParam);
  const categoryTitle = currentCategory?.label || (categoryParam ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) : 'Категория');

  useEffect(() => {
    // Fetch products if not already loaded or to ensure freshness for category view
    // This condition might be refined based on overall app data loading strategy
    if (allProducts.length === 0) { // Simple check: fetch if product list is empty
        dispatch(fetchProducts());
    }
    // Fetch categories if not already loaded
    if (categoryList.length === 0) { // Simple check: fetch if category list is empty
        dispatch(fetchCategories());
    }
  }, [dispatch, allProducts.length, categoryList.length]);
  
  const productsForCurrentCategory = allProducts.filter(
    (guitar) => guitar.type.toLowerCase() === categoryParam?.toLowerCase()
  );

  const uniqueBrands = Array.from(new Set(productsForCurrentCategory.map((g) => g.brand || ''))).map((brand) => ({
    value: brand,
    label: brand,
  }));

  const sortAndFilterGuitars = (productsToFilter: Guitar[]): Guitar[] => {
    let filteredGuitars = [...productsToFilter]; // Start with products already filtered by category

    if (searchTerm) {
      filteredGuitars = filteredGuitars.filter((guitar) =>
        guitar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guitar.seller.login.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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

  const sortedAndFilteredGuitars = sortAndFilterGuitars(guitars);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <StyledContainer maxWidth="xl">
      <Title size="h4" text={categoryTitle} />
      <ToolbarWrapper>
        <CustomTextField
          sx={{ width: 220 }}
          label="Поиск по названию или логину продавца"
          value={searchTerm}
          onChange={(value: string) => setSearchTerm(value)}
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