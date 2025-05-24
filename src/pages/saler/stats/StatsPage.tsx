import React, { useEffect, useState } from 'react';
import { Card, CardContent, Container, Typography, Button, Stack } from '@mui/material';
import Plot from 'react-plotly.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from 'src/components';
import { DetailItem, StatItem } from '../../../types/stats';
import { AppDispatch, RootState } from '../../../storage/store';
import { fetchSalerStats, clearStats } from '../../../storage/features/statsSlice';
import { useNavigate } from 'react-router-dom'; // For potential redirect
import { ROUTES } from 'src/constants';


export const StatsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { 
    basketStats, 
    favoritesStats, 
    basketDetails, 
    favoritesDetails, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.stats);
  
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [period, setPeriod] = useState<'week' | 'month' | 'halfYear'>('week');
  // Local loading state removed, using isLoading from Redux

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN); // Redirect if not authenticated
      return;
    }

    const sellerLogin = authUser?.login;
    if (sellerLogin) {
      dispatch(fetchSalerStats(sellerLogin));
    } else {
      // Handle case where seller login is not available (e.g., display error, though authUser should ideally exist if authenticated)
      console.error("StatsPage: Seller login not found in auth state.");
      // dispatch(setStatsError("Логин продавца не найден, не могу загрузить статистику.")); // Optional: dispatch an error to statsSlice
    }

    return () => {
      // Optionally clear stats when component unmounts or user changes
      // dispatch(clearStats()); 
    };
  }, [dispatch, authUser, isAuthenticated, navigate]);

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

  const getHoverDetails = (date: string, details: DetailItem[]) => {
    const dateDetails = details.filter(item => item.date === date);
    if (dateDetails.length === 0) return 'Нет данных';

    return dateDetails
      .map(item => `• Товар: ${item.productName} — Покупатель: ${item.userLogin}`)
      .join('<br>');
  };

  const handleExport = () => {
    const basketSheet = XLSX.utils.json_to_sheet(
      basketDetails.map(item => ({
        'Дата': item.date,
        'ID товара': item.productId,
        'Название товара': item.productName,
        'ID покупателя': item.userId,
        'Логин покупателя': item.userLogin,
      }))
    );

    const favoritesSheet = XLSX.utils.json_to_sheet(
      favoritesDetails.map(item => ({
        'Дата': item.date,
        'ID товара': item.productId,
        'Название товара': item.productName,
        'ID покупателя': item.userId,
        'Логин покупателя': item.userLogin,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, basketSheet, 'Корзина');
    XLSX.utils.book_append_sheet(workbook, favoritesSheet, 'Избранное');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'Статистика.xlsx');
  };

  const { filteredData: filteredBasketData, filteredDetails: filteredBasketDetails } =
    filterDataByPeriod(basketData, basketDetails, period);
  const { filteredData: filteredFavoritesData, filteredDetails: filteredFavoritesDetails } =
    filterDataByPeriod(favoritesData, favoritesDetails, period);

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
                marker: { color },
                hovertemplate: `
                  <br><b>Дата: %{x}</b>
                  <br>Кол-во: %{y}
                  <br>%{customdata}
                  <extra></extra>
                `,
                customdata: data.map(item => getHoverDetails(item._id, details)),
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