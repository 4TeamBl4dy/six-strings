import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store/store';
import {
  fetchSellerProducts,
  createSellerProduct,
  updateExistingSellerProduct,
  deleteExistingSellerProduct
} from 'src/store/sellerProductSlice';
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
import { Guitar } from 'src/types';

export const MyProductsPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { items: guitars, isLoading: loading, error: reduxError } = useSelector((state: RootState) => state.sellerProducts);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuitar, setEditingGuitar] = useState<Guitar | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [formError, setFormError] = useState<string | null>(null); 

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

  useEffect(() => {
    if (sellerLogin) {
      dispatch(fetchSellerProducts(sellerLogin));
    }
  }, [dispatch, sellerLogin]);

  const uniqueTypes = Array.from(new Set(guitars.map((g) => g.type))).map((value) => ({
    value,
    label: categories.find((cat) => cat.value === value)?.label || value,
  }));
  const uniqueBrands = Array.from(new Set(guitars.map((g) => g.brand))).map((brand) => ({
    value: brand,
    label: brand,
  }));

  const resetForm = useCallback(() => {
    setImgFile(null);
    setName('');
    setDescription('');
    setCost('');
    setAmount('');
    setType('');
    setBrand('');
    setFormError(null);
    setEditingGuitar(null);
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    setImgFile(file);
  }, []);

  const handleOpenModal = useCallback(() => {
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleEditGuitar = useCallback((guitar: Guitar) => {
    setEditingGuitar(guitar);
    setName(guitar.name);
    setDescription(guitar.description);
    setCost(String(guitar.cost));
    setAmount(String(guitar.amount));
    setType(guitar.type);
    setBrand(guitar.brand);
    setImgFile(null); 
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!name || (!imgFile && !editingGuitar) || !description || !cost || !amount || !type || !brand) {
      setFormError('Заполните все поля.');
      return;
    }
    setFormError(null); 

    const formData = new FormData();
    if (imgFile) {
      formData.append('img', imgFile);
    } else if (editingGuitar?.img) {
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

    if (editingGuitar) {
      dispatch(updateExistingSellerProduct({ guitarId: editingGuitar._id, formData }))
        .unwrap()
        .then(() => {
          alert('Товар успешно обновлен!');
          handleCloseModal();
        })
        .catch((updateError) => {
          setFormError(typeof updateError === 'string' ? updateError : 'Не удалось обновить товар.');
        });
    } else {
      dispatch(createSellerProduct(formData))
        .unwrap()
        .then(() => {
          alert('Товар успешно добавлен!');
          handleCloseModal();
        })
        .catch((createError) => {
          setFormError(typeof createError === 'string' ? createError : 'Не удалось добавить товар.');
        });
    }
  }, [dispatch, imgFile, name, description, cost, amount, type, brand, editingGuitar, sellerLogin, userName, userPhone, handleCloseModal]);

  const handleDeleteGuitar = useCallback(async (guitarId: string) => {
    dispatch(deleteExistingSellerProduct(guitarId))
      .unwrap()
      .then(() => alert('Товар успешно удален!'))
      .catch((deleteError) => {
        alert(typeof deleteError === 'string' ? deleteError : 'Не удалось удалить товар.');
      });
  }, [dispatch]);

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
          {formError && <ErrorAlert severity="error">{formError}</ErrorAlert>}
          {reduxError && <ErrorAlert severity="error">{reduxError}</ErrorAlert>}
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