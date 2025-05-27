import { useEffect, useState } from 'react';
import { Card, Container, Typography, Button, Stack } from '@mui/material';
import axios from 'axios';
import { Loader, renderPlot, useToast } from 'src/components';
import { DetailItem, StatItem, PaymentItem } from 'src/types';
import { handleExport } from 'src/hooks';
import apiClient from 'src/api';

export const StatsPage = () => {
    const [basketData, setBasketData] = useState<StatItem[]>([]);
    const [favoritesData, setFavoritesData] = useState<StatItem[]>([]);
    const [basketDetails, setBasketDetails] = useState<DetailItem[]>([]);
    const [favoritesDetails, setFavoritesDetails] = useState<DetailItem[]>([]);
    const [paymentDetails, setPaymentDetails] = useState<PaymentItem[]>([]);
    const [period, setPeriod] = useState<'week' | 'month' | 'halfYear'>('week');
    const [loading, setLoading] = useState<boolean>(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    console.error('Токен отсутствует. Пожалуйста, войдите в систему.');
                    setLoading(false);
                    return;
                }

                setLoading(true);
                const sellerLogin = localStorage.getItem('login') || '';
                const response = await apiClient.get('/stats', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: { sellerLogin },
                });

                const data = response.data;
                setBasketData(data.basket || []);
                setFavoritesData(data.favorites || []);
                setBasketDetails(data.basketDetails || []);
                setFavoritesDetails(data.favoritesDetails || []);
                setPaymentDetails(data.paymentDetails || []);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при получении статистики:', error);
                setLoading(false);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    showToast('Ошибка авторизации. Пожалуйста, войдите снова.', 'error');
                }
            }
        };

        fetchStats();
    }, []);

    const filterDataByPeriod = (data: StatItem[], details: DetailItem[], periodType: 'week' | 'month' | 'halfYear') => {
        const today = new Date();
        let startDate = new Date(today);

        switch (periodType) {
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'halfYear':
                startDate.setMonth(today.getMonth() - 6);
                break;
        }

        const allDates: StatItem[] = [];
        const currentDate = new Date(startDate);
        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const existingItem = data.find((item) => item._id === dateStr);
            allDates.push({ _id: dateStr, total: existingItem ? existingItem.total : 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const filteredDetails = details.filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= today;
        });

        return { filteredData: allDates, filteredDetails };
    };

    const filterPaymentsByPeriod = (payments: PaymentItem[], periodType: 'week' | 'month' | 'halfYear') => {
        const today = new Date();
        let startDate = new Date(today);

        switch (periodType) {
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'halfYear':
                startDate.setMonth(today.getMonth() - 6);
                break;
        }

        return payments.filter((payment) => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= startDate && paymentDate <= today && payment.status === 'succeeded';
        });
    };

    const { filteredData: filteredBasketData, filteredDetails: filteredBasketDetails } = filterDataByPeriod(
        basketData,
        basketDetails,
        period
    );
    const { filteredData: filteredFavoritesData, filteredDetails: filteredFavoritesDetails } = filterDataByPeriod(
        favoritesData,
        favoritesDetails,
        period
    );
    const filteredPaymentDetails = filterPaymentsByPeriod(paymentDetails, period);

    // Расчет общего заработка на основе платежей
    const totalEarnings = filteredPaymentDetails.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Расчет общего количества добавлений в избранное
    const totalFavorites = filteredFavoritesDetails.length;

    // Подсчет самого продаваемого товара
    const basketProductCounts: { [key: string]: { count: number; name: string } } = {};
    filteredBasketDetails.forEach((item) => {
        if (!basketProductCounts[item.productId]) {
            basketProductCounts[item.productId] = { count: 0, name: item.productName };
        }
        basketProductCounts[item.productId].count += 1;
    });

    const mostSoldProduct =
        Object.values(basketProductCounts).length > 0
            ? Object.values(basketProductCounts).reduce((a, b) => (a.count > b.count ? a : b)).name
            : 'Нет данных';

    // Подсчет самых популярных товаров в избранном
    const favoritesProductCounts: { [key: string]: { count: number; name: string } } = {};
    filteredFavoritesDetails.forEach((item) => {
        if (!favoritesProductCounts[item.productId]) {
            favoritesProductCounts[item.productId] = { count: 0, name: item.productName };
        }
        favoritesProductCounts[item.productId].count += 1;
    });

    let topFavorites: string[] = [];
    if (Object.values(favoritesProductCounts).length > 0) {
        const maxFavoritesCount = Math.max(...Object.values(favoritesProductCounts).map((item) => item.count));
        topFavorites = Object.values(favoritesProductCounts)
            .filter((item) => item.count === maxFavoritesCount)
            .map((item) => item.name);
    } else {
        topFavorites = ['Нет данных'];
    }

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Loader />
            </Container>
        );
    }

    return (
        <Container maxWidth={false} sx={{ mt: 1, width: '100%', padding: 0 }}>
            <Stack
                direction={{ xs: 'column', lg: 'row' }}
                justifyContent={{ xs: 'flex-start', lg: 'space-between' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                mb={2}
                sx={{ paddingX: 2, gap: { xs: 2, lg: 0 } }}
                >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, lg: 0 } }}>
                    Статистика по продажам и добавлений в избранное
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant={period === 'week' ? 'contained' : 'outlined'} onClick={() => setPeriod('week')}>
                    Неделя
                    </Button>
                    <Button variant={period === 'month' ? 'contained' : 'outlined'} onClick={() => setPeriod('month')}>
                    Месяц
                    </Button>
                    <Button
                    variant={period === 'halfYear' ? 'contained' : 'outlined'}
                    onClick={() => setPeriod('halfYear')}
                    >
                    Полгода
                    </Button>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                        handleExport(
                        basketData,
                        favoritesData,
                        basketDetails,
                        favoritesDetails,
                        paymentDetails,
                        period,
                        totalEarnings,
                        totalFavorites,
                        mostSoldProduct,
                        topFavorites,
                        filterDataByPeriod,
                        filterPaymentsByPeriod
                        )
                    }
                    >
                    Скачать в Excel
                    </Button>
                </Stack>
            </Stack>

            <Stack direction="column" spacing={2} mb={2} sx={{ paddingX: 2, paddingBottom: 2 }}>
                <Stack
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ gap: 2 }}
                >
                    <Card sx={{ p: 2, boxShadow: 1, borderRadius: 2, width: { xs: '100%', sm: '48%', md: '48%' } }}>
                        <Typography variant="h6">Общий заработок</Typography>
                        <Typography variant="h6" color="orange">
                            {totalEarnings.toFixed(2)} ₸
                        </Typography>
                    </Card>
                    <Card sx={{ p: 2, boxShadow: 1, borderRadius: 2, width: { xs: '100%', sm: '48%', md: '48%' } }}>
                        <Typography variant="h6">Добавлений в избранное</Typography>
                        <Typography variant="h6" color="red">
                            {totalFavorites}
                        </Typography>
                    </Card>
                </Stack>
                <Stack
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ gap: 2 }}
                >
                    <Card sx={{ p: 2, boxShadow: 1, borderRadius: 2, width: { xs: '100%', sm: '48%', md: '48%' } }}>
                        <Typography variant="h6">Самый продаваемый товар</Typography>
                        <Typography variant="h6" color="orange">
                            {mostSoldProduct}
                        </Typography>
                    </Card>
                    <Card sx={{ p: 2, boxShadow: 1, borderRadius: 2, width: { xs: '100%', sm: '48%', md: '48%' } }}>
                        <Typography variant="h6">Популярный в избранном</Typography>
                        <Stack>
                            {topFavorites.map((item, index) => (
                                <Typography key={index} variant="h6" color="red">
                                    {item}
                                </Typography>
                            ))}
                        </Stack>
                    </Card>
                </Stack>
            </Stack>

            {filteredBasketData.length === 0 && filteredFavoritesData.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center">
                    Нет данных за выбранный период.
                </Typography>
            ) : (
                <>
                    {renderPlot('Продано товаров', filteredBasketData, filteredBasketDetails, '#FB8C00')}
                    {renderPlot('Добавили в избранное', filteredFavoritesData, filteredFavoritesDetails, '#E53935')}
                </>
            )}
        </Container>
    );
};
