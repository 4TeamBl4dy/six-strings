import { LineChart } from '@mui/x-charts/LineChart';
import {
  Card,
  CardContent,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

export const StatsPage = () => {
  const [basketData, setBasketData] = useState<StatItem[]>([]);
  const [favoritesData, setFavoritesData] = useState<StatItem[]>([]);
  const [basketDetails, setBasketDetails] = useState<DetailItem[]>([]);
  const [favoritesDetails, setFavoritesDetails] = useState<DetailItem[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sellerLogin = localStorage.getItem('login') || '';
        const response = await axios.get('http://localhost:8080/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          params: { sellerLogin },
        });

        const data = response.data;
        setBasketData(data.basket || []);
        setFavoritesData(data.favorites || []);
        setBasketDetails(data.basketDetails || []);
        setFavoritesDetails(data.favoritesDetails || []);
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
      }
    };

    fetchStats();
  }, []);

  const handleExport = () => {
    const basketSheet = XLSX.utils.json_to_sheet(basketDetails.map(item => ({
      'Дата': item.date,
      'ID товара': item.productId,
      'Название товара': item.productName,
      'ID покупателя': item.userId,
      'Логин покупателя': item.userLogin,
    })));

    const favoritesSheet = XLSX.utils.json_to_sheet(favoritesDetails.map(item => ({
      'Дата': item.date,
      'ID товара': item.productId,
      'Название товара': item.productName,
      'ID покупателя': item.userId,
      'Логин покупателя': item.userLogin,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, basketSheet, 'Корзина');
    XLSX.utils.book_append_sheet(workbook, favoritesSheet, 'Избранное');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'Статистика.xlsx');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Статистика по продажам и добавлений в избранное
        </Typography>
        <Button variant="contained" color="primary" onClick={handleExport}>
          Скачать в Excel
        </Button>
      </Stack>

      <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3, p: 2, backgroundColor: '#fafafa' }}>
        <CardContent>
          <Typography variant="h6" fontSize="16px" gutterBottom>
            Продано товаров
          </Typography>
          <LineChart
            xAxis={[{ scaleType: 'point', data: basketData.map(item => item._id), label: 'Дата' }]}
            yAxis={[{
              label: 'Количество продаж',
              valueFormatter: (v: number) => Math.round(v).toString(),
              tickMinStep: 1,
              min: 0,
            }]}
            series={[{ data: basketData.map(item => item.total), label: 'Продажи', color: '#FB8C00' }]}
            height={300}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3, p: 2, backgroundColor: '#fafafa' }}>
        <CardContent>
          <Typography variant="h6" fontSize="16px" gutterBottom>
            Добавили в избранное
          </Typography>
          <LineChart
            xAxis={[{ scaleType: 'point', data: favoritesData.map(item => item._id), label: 'Дата' }]}
            yAxis={[{
              label: 'Количество человек',
              valueFormatter: (v: number) => Math.round(v).toString(),
              tickMinStep: 1,
              min: 0,
            }]}
            series={[{ data: favoritesData.map(item => item.total), label: 'Избранное', color: '#E53935' }]}
            height={300}
          />
        </CardContent>
      </Card>
    </Container>
  );
};
