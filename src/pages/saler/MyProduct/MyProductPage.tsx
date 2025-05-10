import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import {
  StyledContainer,
  PageTitle,
  ToolbarWrapper,
  AddButton,
  ProductsGrid,
  GuitarCard,
  GuitarCardMedia,
  GuitarCardContent,
  ActionButton,
  StyledModal,
  ModalContent,
  ModalHeader,
  CloseButton,
  ModalButton,
  ModalButtonWrapper,
  ErrorAlert,
} from './styles';
import { Typography, Grid, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CustomTextField, CustomSelect, CustomFileInput } from 'src/components';

interface Guitar {
  _id: string;
  img: string;
  name: string;
  description: string;
  cost: number;
  amount: number;
  type: string;
  brand: string;
  seller: {
    login: string;
    name: string;
    phone: string;
  };
}

export const MyProductsPage = () => {
  const [guitars, setGuitars] = useState<Guitar[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuitar, setEditingGuitar] = useState<Guitar | null>(null);

  const [img, setImage] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');

  const [searchName, setSearchName] = useState('');
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string[]>([]);

  const sellerLogin = localStorage.getItem('login') || '';
  const userName = localStorage.getItem('userName') || '';
  const userPhone = localStorage.getItem('userPhone') || '';

  const categories = [
    { value: 'electric', label: 'Электрические гитары' },
    { value: 'acoustic', label: 'Акустические гитары' },
    { value: 'classic', label: 'Классические гитары' },
    { value: 'bass', label: 'Бас-гитары' },
    { value: 'combo', label: 'Комбоусилители' },
    { value: 'accessories', label: 'Аксессуары' },
  ];

  // Загрузка товаров продавца
  useEffect(() => {
    const fetchGuitars = async () => {
      try {
        const response: AxiosResponse<Guitar[]> = await axios.get('http://localhost:8080/guitars');
        const sellerGuitars = response.data.filter((guitar) => guitar.seller?.login === sellerLogin);
        setGuitars(sellerGuitars || []);
      } catch (error) {
        setError('Не удалось загрузить товары.');
      }
    };
    if (sellerLogin) {
      fetchGuitars();
    }
  }, [sellerLogin]);

  // Получение уникальных типов и брендов для фильтров
  const uniqueTypes = Array.from(new Set(guitars.map((g) => g.type))).map((value) => ({
    value,
    label: categories.find((cat) => cat.value === value)?.label || value,
  }));
  const uniqueBrands = Array.from(new Set(guitars.map((g) => g.brand))).map((brand) => ({
    value: brand,
    label: brand,
  }));

  // Сброс формы
  const resetForm = useCallback(() => {
    setImage(null);
    setName('');
    setDescription('');
    setCost('');
    setAmount('');
    setType('');
    setBrand('');
    setError(null);
    setEditingGuitar(null);
  }, []);

  // Обработка изменения изображения
  const handleImageChange = useCallback((file: File | null) => {
    setImage(file);
  }, []);

  // Открытие модального окна для добавления
  const handleOpenModal = useCallback(() => {
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  // Открытие модального окна для редактирования
  const handleEditGuitar = useCallback((guitar: Guitar) => {
    setEditingGuitar(guitar);
    setName(guitar.name);
    setDescription(guitar.description);
    setCost(String(guitar.cost));
    setAmount(String(guitar.amount));
    setType(guitar.type);
    setBrand(guitar.brand);
    setImage(null);
    setModalOpen(true);
  }, []);

  // Закрытие модального окна
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    resetForm();
  }, [resetForm]);

  // Создание или обновление товара
  const handleSubmit = useCallback(async () => {
    if (!name || (!img && !editingGuitar) || !description || !cost || !amount || !type || !brand) {
      setError('Заполните все поля.');
      return;
    }

    try {
      const formData = new FormData();
      if (img) {
        formData.append('img', img);
      } else if (editingGuitar) {
        formData.append('img', editingGuitar.img);
      }
      formData.append('name', name);
      formData.append('description', description);
      formData.append('cost', String(parseFloat(cost)));
      formData.append('amount', String(parseInt(amount, 10)));
      formData.append('type', type);
      formData.append('brand', brand);
      formData.append('sellerLogin', sellerLogin);
      formData.append('userName', userName);
      formData.append('userPhone', userPhone);

      let response: AxiosResponse<Guitar>;
      if (editingGuitar) {
        response = await axios.put(`http://localhost:8080/guitars/${editingGuitar._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
        setGuitars((prev) =>
          prev.map((g) => (g._id === editingGuitar._id ? response.data : g))
        );
      } else {
        response = await axios.post('http://localhost:8080/guitars', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setGuitars((prev) => [...prev, response.data]);
      }

      handleCloseModal();
    } catch (error) {
      setError('Не удалось сохранить товар.');
    }
  }, [img, name, description, cost, amount, type, brand, editingGuitar, sellerLogin, userName, userPhone, handleCloseModal]);

  // Удаление товара
  const handleDeleteGuitar = useCallback(async (guitarId: string) => {
    try {
      await axios.delete(`http://localhost:8080/guitars/${guitarId}`);
      setGuitars((prev) => prev.filter((g) => g._id !== guitarId));
    } catch (error) {
      setError('Не удалось удалить товар.');
    }
  }, []);

  // Фильтрация и сортировка товаров
  const filteredGuitars = guitars
    .filter((guitar) =>
      guitar.name.toLowerCase().includes(searchName.toLowerCase()) &&
      (filterTypes.length ? filterTypes.includes(guitar.type) : true) &&
      (filterBrands.length ? filterBrands.includes(guitar.brand) : true)
    )
    .sort((a, b) => {
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

  return (
    <StyledContainer maxWidth="xl">
      <PageTitle variant="h5">Мои товары</PageTitle>

      {/* Панель инструментов */}
      <ToolbarWrapper>
        <CustomTextField
          label="Поиск по названию"
          value={searchName}
          onChange={(value: string) => setSearchName(value)}
        />
        <CustomSelect
          label="Фильтр по типам"
          value={filterTypes}
          onChange={(value: string | string[]) => setFilterTypes(value as string[])}
          options={categories}
          multiple
        />
        <CustomSelect
          label="Фильтр по брендам"
          value={filterBrands}
          onChange={(value: string | string[]) => setFilterBrands(value as string[])}
          options={uniqueBrands}
          multiple
        />
        <CustomSelect
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
        <AddButton onClick={handleOpenModal}>Добавить товар</AddButton>
      </ToolbarWrapper>

      {/* Карточки товаров */}
      <ProductsGrid container>
        {filteredGuitars.map((guitar) => (
          <Grid item key={guitar._id} xs={12} sm={6} md={4} lg={2}>
            <GuitarCard>
              <GuitarCardMedia image={guitar.img} />
              <GuitarCardContent>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {guitar.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Тип: {categories.find((cat) => cat.value === guitar.type)?.label || guitar.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Бренд: {guitar.brand}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {guitar.cost}тг
                  </Typography>
                  {guitar.amount === 0 && (
                    <Typography variant="body2" color="error.main">
                      Нет в наличии
                    </Typography>
                  )}
                </Box>
                <Box display="flex" gap={1} mt={1}>
                  <ActionButton onClick={() => handleEditGuitar(guitar)}>Изменить</ActionButton>
                  <ActionButton onClick={() => handleDeleteGuitar(guitar._id)}>Удалить</ActionButton>
                </Box>
              </GuitarCardContent>
            </GuitarCard>
          </Grid>
        ))}
      </ProductsGrid>

      {/* Модальное окно для добавления/редактирования */}
      <StyledModal open={modalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader>
            <PageTitle variant="h6">{editingGuitar ? 'Редактировать товар' : 'Добавить товар'}</PageTitle>
            <CloseButton onClick={handleCloseModal}>
              <CloseIcon fontSize="small" />
            </CloseButton>
          </ModalHeader>
          {error && <ErrorAlert severity="error">{error}</ErrorAlert>}
          <CustomFileInput onChange={handleImageChange} />
          <CustomTextField
            label="Название"
            value={name}
            onChange={(value: string) => setName(value)}
          />
          <CustomTextField
            label="Описание"
            value={description}
            onChange={(value: string) => setDescription(value)}
            multiline
            rows={3}
          />
          <CustomTextField
            label="Цена"
            value={cost}
            onChange={(value: string) => setCost(value)}
            type="number"
          />
          <CustomTextField
            label="Количество"
            value={amount}
            onChange={(value: string) => setAmount(value)}
            type="number"
          />
          <CustomSelect
            label="Тип"
            value={type}
            onChange={(value: string | string[]) => setType(value as string)}
            options={categories}
          />
          <CustomTextField
            label="Бренд"
            value={brand}
            onChange={(value: string) => setBrand(value)}
          />
          <ModalButtonWrapper>
            <ModalButton onClick={handleSubmit}>
              {editingGuitar ? 'Сохранить' : 'Добавить'}
            </ModalButton>
            <ModalButton onClick={handleCloseModal}>Отменить</ModalButton>
          </ModalButtonWrapper>
        </ModalContent>
      </StyledModal>
    </StyledContainer>
  );
};