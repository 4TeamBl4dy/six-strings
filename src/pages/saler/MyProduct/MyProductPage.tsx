import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
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
import { Typography, Grid, Box, Container } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CustomTextField, CustomSelect, CustomFileInput, Loader } from 'src/components';
import { Guitar } from '../../../types/product';
import { AppDispatch, RootState } from '../../../storage/store';
import {
  fetchSalerProducts,
  createSalerProduct,
  updateSalerProduct,
  deleteSalerProduct,
  clearSalerProductProcessingError,
  // setSalerProductProcessingError // If needed for specific client-side error setting
} from '../../../storage/features/salerProductSlice';

export const MyProductsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    products: salerProductsList, 
    isLoading, 
    error: fetchError, 
    isProcessing, 
    processingError 
  } = useSelector((state: RootState) => state.salerProducts);
  
  const authUser = useSelector((state: RootState) => state.auth.user);

  // Local state for modal and form inputs remains
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuitar, setEditingGuitar] = useState<Guitar | null>(null);
  // Local error for form validation, API errors handled by processingError
  const [formValidationError, setFormValidationError] = useState<string | null>(null); 

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
  // loading state is now from Redux (isLoading)

  // sellerLogin from authUser in Redux state
  const sellerLogin = authUser?.login || ''; 
  // userName and userPhone for new products might need to come from authUser or a more detailed seller profile
  const userName = authUser?.name || ''; 
  const userPhone = authUser?.phone || ''; 


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
    if (sellerLogin) {
      dispatch(fetchSalerProducts(sellerLogin));
    } else {
      // Handle case where sellerLogin is not available (e.g., show error, redirect)
      // For now, fetchError from Redux will show if thunk is dispatched and fails.
      // Or, set a local error if not dispatching.
      console.warn("Seller login not found, cannot fetch products.");
    }
    return () => {
        dispatch(clearSalerProductProcessingError()); // Clear processing errors on unmount
    };
  }, [dispatch, sellerLogin]);

  // Получение уникальных типов и брендов для фильтров
  const uniqueTypes = Array.from(new Set(salerProductsList.map((g) => g.type))).map((value) => ({
    value,
    label: categories.find((cat) => cat.value === value)?.label || value,
  }));
  const uniqueBrands = Array.from(new Set(salerProductsList.map((g) => g.brand))).map((brand) => ({
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
    setFormValidationError(null); // Clear form validation error
    dispatch(clearSalerProductProcessingError()); // Clear API processing error
    setEditingGuitar(null);
  }, [dispatch]);

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
    if (!name || (!img && !editingGuitar?.img) || !description || !cost || !amount || !type || !brand) {
      setFormValidationError('Заполните все поля (и изображение для нового товара).');
      return;
    }
    setFormValidationError(null);
    dispatch(clearSalerProductProcessingError());

    const formData = new FormData();
    if (img) { // If a new image is selected for new or existing product
      formData.append('img', img);
    } 
    // Note: If editing and no new image, backend must handle not overwriting existing image if 'img' field is absent.
    // Or, if API requires 'img' field even if not changed, append editingGuitar.img (but this sends unnecessary data).
    // Current api/myProducts.ts doesn't explicitly handle this, assumes backend logic.

    formData.append('name', name);
    formData.append('description', description);
    formData.append('cost', String(parseFloat(cost)));
    formData.append('amount', String(parseInt(amount, 10)));
    formData.append('type', type);
    formData.append('brand', brand);
    formData.append('sellerLogin', sellerLogin); // From authUser.login
    formData.append('userName', userName);     // From authUser.name
    formData.append('userPhone', userPhone);   // From authUser.phone

    const actionToDispatch = editingGuitar
      ? updateSalerProduct({ productId: editingGuitar._id, productData: formData })
      : createSalerProduct(formData);

    dispatch(actionToDispatch)
      .unwrap()
      .then(() => {
        alert(`Товар успешно ${editingGuitar ? 'обновлен' : 'добавлен'}!`);
        handleCloseModal();
      })
      .catch((errorPayload) => {
        // Error is already in processingError from Redux state
        // No need to set local error unless for specific UI element not covered by global error
      });
  }, [
    dispatch, img, name, description, cost, amount, type, brand, 
    editingGuitar, sellerLogin, userName, userPhone, handleCloseModal
  ]);

  // Удаление товара
  const handleDeleteGuitar = useCallback(async (guitarId: string) => {
    dispatch(clearSalerProductProcessingError());
    dispatch(deleteSalerProduct(guitarId))
      .unwrap()
      .then(() => {
        alert('Товар успешно удален!');
      })
      .catch((errorPayload) => {
        // Error is in processingError
      });
  }, [dispatch]);

  // Фильтрация и сортировка товаров
  const filteredGuitars = salerProductsList // Use products from Redux state
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

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
        <Loader />
      </Container>
    );
  }  

  return (
    <StyledContainer maxWidth="xl">
      <PageTitle variant="h5">Мои товары</PageTitle>

      {/* Панель инструментов */}
      <ToolbarWrapper>
        <CustomTextField
          sx={{width: 220}}
          label="Поиск по названию"
          value={searchName}
          onChange={(value: string) => setSearchName(value)}
        />
        <CustomSelect
          sx={{width: 220}}
          label="Фильтр по типам"
          value={filterTypes}
          onChange={(value: string | string[]) => setFilterTypes(value as string[])}
          options={categories}
          multiple
        />
        <CustomSelect
          sx={{width: 220}}
          label="Фильтр по брендам"
          value={filterBrands}
          onChange={(value: string | string[]) => setFilterBrands(value as string[])}
          options={uniqueBrands}
          multiple
        />
        <CustomSelect
          sx={{width: 220}}
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
                    {guitar.cost}₸
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