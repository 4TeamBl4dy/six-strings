import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DetailItem, StatItem, PaymentItem } from 'src/types';

export const handleExport = (
  basketData: StatItem[],
  favoritesData: StatItem[],
  basketDetails: DetailItem[],
  favoritesDetails: DetailItem[],
  paymentDetails: PaymentItem[],
  period: 'week' | 'month' | 'halfYear',
  totalEarnings: number,
  totalFavorites: number,
  mostSoldProduct: string,
  topFavorites: string[],
  filterDataByPeriod: (data: StatItem[], details: DetailItem[], periodType: 'week' | 'month' | 'halfYear') => { filteredData: StatItem[]; filteredDetails: DetailItem[] },
  filterPaymentsByPeriod: (payments: PaymentItem[], periodType: 'week' | 'month' | 'halfYear') => PaymentItem[]
) => {
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
      'Самый продаваемый товар': mostSoldProduct,
      'Самые популярные в избранном': topFavorites.join(', '),
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