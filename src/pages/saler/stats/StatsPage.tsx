import React, { useEffect, useState } from 'react';
import { Card, CardContent, Container, Typography, Button, Stack } from '@mui/material';
import Plot from 'react-plotly.js';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Loader, useToast } from 'src/components';

type DetailItem = {
  date: string;
  productId: string;
  productName: string;
  userId: string;
  userLogin: string;
};

type StatItem = {
  _id: string;
  total: number;
};

type PaymentItem = {
  _id: string;
  userId: string;
  amount: number;
  transactionId: string;
  status: string;
  createdAt: string;
};

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
        const response = await axios.get('http://localhost:8080/stats', {
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

  const filterDataByPeriod = (
    data: StatItem[],
    details: DetailItem[],
    periodType: 'week' | 'month' | 'halfYear'
  ) => {
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
      const existingItem = data.find(item => item._id === dateStr);
      allDates.push({ _id: dateStr, total: existingItem ? existingItem.total : 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const filteredDetails = details.filter(item => {
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

    return payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= startDate && paymentDate <= today && payment.status === 'succeeded';
    });
  };

  const getHoverDetails = (date: string, details: DetailItem[]) => {
    const dateDetails = details.filter(item => item.date === date);
    if (dateDetails.length === 0) return { title: 'Нет данных', content: [] };

    return {
      title: `Детали на ${date}`,
      content: dateDetails.map(item => ({
        product: item.productName,
        buyer: item.userLogin,
      })),
    };
  };

  const handleExport = () => {
    const { filteredDetails: filteredBasketDetails } = filterDataByPeriod(basketData, basketDetails, period);
    const { filteredDetails: filteredFavoritesDetails } = filterDataByPeriod(favoritesData, favoritesDetails, period);
    const filteredPaymentDetails = filterPaymentsByPeriod(paymentDetails, period);

    // Лист "Корзина"
    const basketSheet = XLSX.utils.json_to_sheet(
      filteredBasketDetails.map(item => ({
        'Дата': item.date,
        'ID товара': item.productId,
        'Название товара': item.productName,
        'ID покупателя': item.userId,
        'Логин покупателя': item.userLogin,
      }))
    );

    // Лист "Избранное"
    const favoritesSheet = XLSX.utils.json_to_sheet(
      filteredFavoritesDetails.map(item => ({
        'Дата': item.date,
        'ID товара': item.productId,
        'Название товара': item.productName,
        'ID покупателя': item.userId,
        'Логин покупателя': item.userLogin,
      }))
    );

    // Лист "Платежи"
    const paymentSheet = XLSX.utils.json_to_sheet(
      filteredPaymentDetails.map(item => ({
        'ID платежа': item._id,
        'ID покупателя': item.userId,
        'Сумма': item.amount,
        'ID транзакции': item.transactionId,
        'Статус': item.status,
        'Дата': item.createdAt,
      }))
    );

    // Лист "Общая статистика"
    const totalStatsSheet = XLSX.utils.json_to_sheet([
      {
        'Период': period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Полгода',
        'Общий заработок': `${totalEarnings.toFixed(2)} ₸`,
        'Добавлений в избранное': totalFavorites,
      },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, basketSheet, 'Корзина');
    XLSX.utils.book_append_sheet(workbook, favoritesSheet, 'Избранное');
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Платежи');
    XLSX.utils.book_append_sheet(workbook, totalStatsSheet, 'Общая статистика');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, `Статистика_${period}.xlsx`);
  };

  const { filteredData: filteredBasketData, filteredDetails: filteredBasketDetails } =
    filterDataByPeriod(basketData, basketDetails, period);
  const { filteredData: filteredFavoritesData, filteredDetails: filteredFavoritesDetails } =
    filterDataByPeriod(favoritesData, favoritesDetails, period);
  const filteredPaymentDetails = filterPaymentsByPeriod(paymentDetails, period);

  // Расчет общего заработка на основе платежей
  const totalEarnings = filteredPaymentDetails.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  // Расчет общего количества добавлений в избранное
  const totalFavorites = filteredFavoritesDetails.length;

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }

  const renderPlot = (title: string, data: StatItem[], details: DetailItem[], color: string) => (
    <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3, backgroundColor: '#fafafa', width: '100%' }}>
      <CardContent sx={{ padding: 0 }}>
        <Typography variant="h6" fontSize="16px" gutterBottom sx={{ paddingX: 2, paddingTop: 2 }}>
          {title}
        </Typography>
        <div style={{ width: '100%', overflow: 'hidden', paddingLeft: '20px' }}>
          <Plot
            data={[
              {
                x: data.map(item => item._id),
                y: data.map(item => item.total),
                type: 'scatter',
                mode: 'lines+markers',
                name: title,
                line: { color },
                marker: { 
                  color,
                  size: 8,
                  line: { width: 1, color: '#ffffff' } // Белая обводка для маркеров
                },
                text: data.map(item => {
                  const hoverInfo = getHoverDetails(item._id, details);
                  return hoverInfo.content.map((d, i) => `<b>${i === 0 ? hoverInfo.title : ''}</b><br>Товар: ${d.product}<br>Покупатель: ${d.buyer}`).join('<br>');
                }),
                hoverinfo: 'text',
                hoverlabel: {
                  bgcolor: 'rgba(255, 255, 255, 0.95)', // Полупрозрачный белый фон
                  bordercolor: 'orange',
                  font: { 
                    size: 12, 
                    color: '#333333', 
                    family: 'Arial, sans-serif' 
                  },
                  align: 'left',
                  // Градиентный эффект через CSS-стиль (пример)
                
                },
              },
            ]}
            layout={{
              height: 400,
              autosize: true,
              xaxis: {
                title: { text: 'Дата', font: { size: 14 } },
                type: 'date',
                fixedrange: true,
                tickformat: '%Y-%m-%d',
                automargin: true,
              },
              yaxis: {
                title: { text: 'Количество', font: { size: 14 } },
                tickformat: '.0f',
                range: [0, Math.max(...data.map(d => d.total || 0), 1) * 1.2],
                fixedrange: true,
                dtick: 1,
                automargin: true,
              },
              margin: { t: 20, b: 60, l: 60, r: 20 },
              plot_bgcolor: '#f5f7fa', // Светлый фон графика
              paper_bgcolor: '#f5f7fa', // Фон всего контейнера
              dragmode: false,
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%' }}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth={false} sx={{ mt: 1, width: '100%', padding: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} sx={{ paddingX: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Статистика по продажам и добавлений в избранное
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant={period === 'week' ? 'contained' : 'outlined'} onClick={() => setPeriod('week')}>
            Неделя
          </Button>
          <Button variant={period === 'month' ? 'contained' : 'outlined'} onClick={() => setPeriod('month')}>
            Месяц
          </Button>
          <Button variant={period === 'halfYear' ? 'contained' : 'outlined'} onClick={() => setPeriod('halfYear')}>
            Полгода
          </Button>
          <Button variant="contained" color="primary" onClick={handleExport}>
            Скачать в Excel
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} sx={{ paddingX: 2, paddingBottom: 2 }}>
        <Card sx={{ p: 2, boxShadow: 1, borderRadius: 2, width: '48%' }}>
          <Typography variant="h6">Общий заработок</Typography>
          <Typography variant="h6" color="orange">{totalEarnings.toFixed(2)} ₸</Typography>
        </Card>
        <Card sx={{ p: 2, boxShadow: 1, borderRadius: 2, width: '48%' }}>
          <Typography variant="h6">Добавлений в избранное</Typography>
          <Typography variant="h6" color="red">{totalFavorites}</Typography>
        </Card>
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