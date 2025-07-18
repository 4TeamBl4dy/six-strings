import { useState, useEffect } from 'react';
import { AxiosResponse, AxiosError } from 'axios';
import { Grid, Container } from '@mui/material';
import {
    StyledContainer,
    ToolbarWrapper,
    ProductsGrid,
} from './styles';
// BasketBtn, FavoriteBtn, ModalWindow removed below
import { CustomTextField, CustomSelect, Title, ProductCard } from 'src/components';
import { Loader } from 'src/components';
import { Guitar } from 'src/types';
import apiClient from 'src/api';

export const CatalogPage = () => {
    const [guitars, setGuitars] = useState<Guitar[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterTypes, setFilterTypes] = useState<string[]>([]);
    const [filterBrands, setFilterBrands] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const err = 'Нет в наличии';

    useEffect(() => {
        setLoading(true);
        apiClient
            .get('/guitars')
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
            filteredGuitars = filteredGuitars.filter(
                (guitar) =>
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
                        <Grid item key={guitar._id} xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <ProductCard guitar={guitar} actionType="customer" />
                        </Grid>
                    ))
                )}
            </ProductsGrid>
        </StyledContainer>
    );
};
