import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import {
    StyledContainer,
    ToolbarWrapper,
    ProductsGrid,
    GuitarCard,
    GuitarCardMedia,
    GuitarCardContent,
    PageTitle,
} from './styles';
import { Typography, Grid, Box, Container } from '@mui/material';
import { ModalWindow, CustomTextField, CustomSelect, Loader } from 'src/components';
import { Guitar } from 'src/types';
import apiClient from 'src/api';

export const ProductsPage: React.FC = () => {
    const [guitars, setGuitars] = useState<Guitar[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterTypes, setFilterTypes] = useState<string[]>([]);
    const [filterBrands, setFilterBrands] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const sellerLogin = localStorage.getItem('login');
        setLoading(true);
        apiClient
            .get<Guitar[]>('/guitars')
            .then((response: AxiosResponse<Guitar[]>) => {
                // Оставляем только товары, не созданные текущим продавцом
                const otherGuitars = response.data.filter((g) => g.seller.login !== sellerLogin);
                setGuitars(otherGuitars);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке каталога:', err);
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
        label: categories.find((c) => c.value === value)?.label || value,
    }));

    const uniqueBrands = Array.from(new Set(guitars.map((g) => g.brand || ''))).map((value) => ({
        value,
        label: value,
    }));

    const sortAndFilter = useCallback(() => {
        let list = [...guitars];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(
                (g) => g.name.toLowerCase().includes(term) || g.seller.login.toLowerCase().includes(term)
            );
        }
        if (filterTypes.length) {
            list = list.filter((g) => filterTypes.includes(g.type));
        }
        if (filterBrands.length) {
            list = list.filter((g) => g.brand && filterBrands.includes(g.brand));
        }
        if (sortBy.length) {
            list.sort((a, b) => {
                for (const s of sortBy) {
                    switch (s) {
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
        }
        return list;
    }, [guitars, searchTerm, filterTypes, filterBrands, sortBy]);

    const filteredGuitars = sortAndFilter();

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
            <PageTitle variant="h5">Товары других продавцов</PageTitle>

            <ToolbarWrapper>
                <CustomTextField
                    sx={{ width: 240 }}
                    label="Поиск по названию или логину продавца"
                    value={searchTerm}
                    onChange={(value: string) => setSearchTerm(value)}
                />
                <CustomSelect
                    sx={{ width: 200 }}
                    label="Фильтр по типам"
                    value={filterTypes}
                    onChange={(value) => setFilterTypes(value as string[])}
                    options={uniqueTypes}
                    multiple
                />
                <CustomSelect
                    sx={{ width: 200 }}
                    label="Фильтр по брендам"
                    value={filterBrands}
                    onChange={(value) => setFilterBrands(value as string[])}
                    options={uniqueBrands}
                    multiple
                />
                <CustomSelect
                    sx={{ width: 200 }}
                    label="Сортировка"
                    value={sortBy}
                    onChange={(value) => setSortBy(value as string[])}
                    options={[
                        { value: 'nameAsc', label: 'Название (А-Я)' },
                        { value: 'nameDesc', label: 'Название (Я-А)' },
                        { value: 'priceAsc', label: 'Цена (возрастание)' },
                        { value: 'priceDesc', label: 'Цена (убывание)' },
                    ]}
                    multiple
                />
            </ToolbarWrapper>

            <ProductsGrid container spacing={2}>
                {filteredGuitars.length === 0 ? (
                    <div>Товары не найдены</div>
                ) : (
                    filteredGuitars.map((guitar) => (
                        <Grid item key={guitar._id} xs={12} sm={6} md={4} lg={3}>
                            <GuitarCard>
                                <GuitarCardMedia image={guitar.img} />
                                <GuitarCardContent>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                            {guitar.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {guitar.seller.login}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {guitar.cost} ₸
                                        </Typography>
                                        {guitar.amount === 0 && (
                                            <Typography variant="body2" color="error.main">
                                                Нет в наличии
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box mt={1}>
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
