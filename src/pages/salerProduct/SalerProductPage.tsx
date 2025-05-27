import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
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
import apiClient from 'src/api';

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
        img?: string;
    };
}

interface Seller {
    login: string;
    name: string;
    phone: string;
    img?: string;
}

export const SalerProductsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const sellerLogin = queryParams.get('seller');

    const [guitars, setGuitars] = useState<Guitar[]>([]);
    const [seller, setSeller] = useState<Seller | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterTypes, setFilterTypes] = useState<string[]>([]);
    const [filterBrands, setFilterBrands] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const err = 'Нет в наличии';

    useEffect(() => {
        if (!sellerLogin) {
            navigate(ROUTES.CATALOG);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const sellerResponse = await apiClient.get(`/saler_info?login=${sellerLogin}`);
                setSeller(sellerResponse.data);

                const guitarsResponse: AxiosResponse<Guitar[]> = await apiClient.get('/guitars');
                const allGuitars = guitarsResponse.data || [];
                const sellerGuitars = allGuitars.filter((guitar) => guitar.seller.login === sellerLogin);
                setGuitars(sellerGuitars);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Не удалось загрузить данные. Попробуйте позже.');
                setLoading(false);
            }
        };

        fetchData();
    }, [sellerLogin, navigate]);

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

    const sortedAndFilteredGuitars = guitars ? sortAndFilterGuitars(guitars) : [];

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Loader />
            </Container>
        );
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (!seller) {
        return <div>Продавец не найден.</div>;
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
                        sx={{
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                        }}
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
