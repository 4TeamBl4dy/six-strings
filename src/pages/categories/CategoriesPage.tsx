import { useState, useEffect, ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography, Grid, Box, Container } from '@mui/material';
import {
    StyledContainer,
    ToolbarWrapper,
    ProductsGrid,
    GuitarCard,
    // GuitarCardMedia, // Removed
    // GuitarCardContent, // Removed
} from './styles';
// BasketBtn, FavoriteBtn, ModalWindow removed below
import { CustomTextField, CustomSelect, Title, Loader, ProductCard } from 'src/components';
import { ROUTES } from 'src/constants';
import { Guitar } from 'src/types';
import apiClient from 'src/api';

export const CategoriesPage = () => {
    const { category } = useParams<{ category: string }>();
    const [guitars, setGuitars] = useState<Guitar[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterBrands, setFilterBrands] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const categoryTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Категория';

    useEffect(() => {
        const fetchGuitars = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/guitars');
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

    const uniqueBrands = Array.from(new Set(guitars.map((g) => g.brand || ''))).map((brand) => ({
        value: brand,
        label: brand,
    }));

    const sortAndFilterGuitars = (guitars: Guitar[]): Guitar[] => {
        let filteredGuitars = guitars.filter((guitar) => guitar.type.toLowerCase() === category?.toLowerCase());

        if (searchTerm) {
            filteredGuitars = filteredGuitars.filter(
                (guitar) =>
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
            <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
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
                        <Grid item key={guitar._id} xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <ProductCard guitar={guitar} actionType="customer" />
                        </Grid>
                    ))
                )}
            </ProductsGrid>
        </StyledContainer>
    );
};
