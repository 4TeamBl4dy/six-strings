import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store/store';
import { fetchSellerProducts } from 'src/store/sellerProductSlice';
import axios from 'axios'; // Keep for seller info fetching until that's moved to Redux/API layer
import { Typography, Grid, Box, Avatar, Link, Container } from '@mui/material';
import {
  StyledContainer,
  ToolbarWrapper,
  ProductsGrid,
  GuitarCard,
  GuitarCardMedia,
  GuitarCardContent,
} from './styles';
import { BasketBtn, FavoriteBtn, ModalWindow, CustomTextField, CustomSelect, Title, Loader } from 'src/components';
import { theme } from 'src/theme';
import { ROUTES } from 'src/constants';
import { normalizePhoneNumber } from 'src/utils';
import { Guitar } from 'src/types'; // Guitar type is sufficient

// Seller interface might be needed if seller info is fetched separately and not part of Guitar type in Redux
interface SellerInfo {
  login: string;
  name: string;
  phone: string;
  img?: string;
}

export const SalerProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const queryParams = new URLSearchParams(location.search);
  const sellerLogin = queryParams.get('seller');

  // Products from Redux store
  const { items: sellerProducts, isLoading: loading, error } = useSelector((state: RootState) => state.sellerProducts);
  
  // Local state for seller info - this could also be moved to Redux if needed elsewhere
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  // Local state for filters and sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string[]>([]);
  // Local error state for issues like seller not found, or sellerLogin missing
  const [localError, setLocalError] = useState<string | null>(null);

  const err = 'Нет в наличии';

  useEffect(() => {
    if (!sellerLogin) {
      navigate(ROUTES.CATALOG); // Or show an error message
      setLocalError("Логин продавца не указан в URL.");
      return;
    }
    setLocalError(null); // Clear previous local errors

    // Fetch seller-specific products
    dispatch(fetchSellerProducts(sellerLogin));

    // Fetch seller info (still using axios for this part as per current structure)
    // This could be refactored into an API call and potentially a Redux thunk if seller info is complex
    axios.get(`http://localhost:8080/saler_info?login=${sellerLogin}`)
      .then(response => {
        setSeller(response.data);
      })
      .catch(err => {
        console.error('Ошибка при загрузке информации о продавце:', err);
        setLocalError('Не удалось загрузить информацию о продавце.');
        setSeller(null); // Ensure seller is null if fetch fails
      });
  }, [dispatch, sellerLogin, navigate]);

  const categories = [
    { value: 'electric', label: 'Электрические гитары' },
    { value: 'acoustic', label: 'Акустические гитары' },
    { value: 'classic', label: 'Классические гитары' },
    { value: 'bass', label: 'Бас-гитары' },
    { value: 'combo', label: 'Комбоусилители' },
    { value: 'accessories', label: 'Аксессуары' },
  ];

  const uniqueTypes = Array.from(new Set(sellerProducts.map((g) => g.type))).map((value) => ({
    value,
    label: categories.find((cat) => cat.value === value)?.label || value,
  }));
  const uniqueBrands = Array.from(new Set(sellerProducts.map((g) => g.brand || ''))).map((brand) => ({
    value: brand,
    label: brand,
  }));

  const sortAndFilterGuitars = (guitars: Guitar[]): Guitar[] => {
    let filteredGuitars = guitars;

    if (searchTerm) {
      filteredGuitars = filteredGuitars.filter((guitar) =>
        guitar.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const sortedAndFilteredGuitars = sellerProducts ? sortAndFilterGuitars(sellerProducts) : [];

  if (loading) { // isLoading from Redux store
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }

  if (error) { // error from Redux store
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</div>;
  }
  if (localError) { // localError for seller info or missing login
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{localError}</div>;
  }

  if (!seller && !loading) { // If loading is false and seller is still null
    return <div style={{ textAlign: 'center', marginTop: '20px' }}>Информация о продавце не найдена.</div>;
  }

  // Нормализуем номер телефона перед созданием ссылки
  const normalizedPhone = normalizePhoneNumber(seller.phone);
  const whatsappLink = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent('Здравствуйте! Я пишу Вам с онлайн площадки SixStrings, ')}`;

  return (
    <StyledContainer maxWidth="xl">
      {/* Шапка с данными продавца */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar
          src={seller.img || '/broken-image.jpg'}
          sx={{ width: 60, height: 60, bgcolor: '#FF6428', mr: 2 }}
        >
          {seller.login[0]}
        </Avatar>
        <Box>
          <Typography fontSize={'16px'}>{seller.login}</Typography>
          <Typography fontSize={'14px'}>{seller.name}</Typography>
          <Typography
            fontSize={'14px'}
            component={Link}
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            onError={() => console.error('Ошибка при открытии WhatsApp: неверный номер телефона')}
          >
            {seller.phone}
          </Typography>
        </Box>
      </Box>

      <Title size={'h5'} text={`Товары продавца ${seller.login}`} sx={{ marginBottom: 2 }} />
      <ToolbarWrapper>
        <CustomTextField
          sx={{ width: 220 }}
          label="Поиск по названию"
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
                    <Typography variant="body2" color={theme.palette.primary.main}>
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