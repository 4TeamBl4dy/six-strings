import { styled } from '@mui/material/styles';
import { Box, Container, Typography, Button, Card, CardMedia, CardContent, Grid, Modal, Alert, IconButton } from '@mui/material';

// Контейнер страницы
export const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

// Заголовок страницы
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  textAlign: 'left',
  marginBottom: theme.spacing(2),
  color: '#FF6428',
  fontSize: '1.25rem',
}));

// Панель инструментов
export const ToolbarWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(4),
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  paddingBottom: theme.spacing(1),
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[400],
    borderRadius: '4px',
  },
}));

// Кнопка добавления товара
export const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF6428',
  color: theme.palette.common.white,
  borderRadius: '6px',
  padding: theme.spacing(0.75, 2),
  fontWeight: 600,
  fontSize: '0.875rem',
  '&:hover': {
    backgroundColor: '#d15321',
  },
  maxWidth: '200px',
  minWidth: '150px',
}));

// Контейнер карточек товаров
export const ProductsGrid = styled(Grid)(({ theme }) => ({
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  alignItems: 'stretch',
}));

// Карточка товара
export const GuitarCard = styled(Card)(({ theme }) => ({
  minWidth: theme.breakpoints.down('sm') ? '160px' : '200px',
  maxWidth: '200px',
  flexShrink: 0,
  margin: theme.spacing(2),
  borderRadius: theme.spacing(2),
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const GuitarCardMedia = styled(CardMedia)({
  height: '200px',
});

export const GuitarCardContent = styled(CardContent)(({ theme }) => ({
  padding: '12px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

// Кнопки действия в карточке
export const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF6428',
  color: theme.palette.common.white,
  borderRadius: '5px',
  fontSize: '0.75rem',
  padding: theme.spacing(0.5, 1),
  marginRight: theme.spacing(1),
  '&:hover': {
    backgroundColor: '#d15321',
  },
}));

// Модальное окно
export const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  width: '360px',
  maxWidth: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: theme.shadows[5],
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

// Заголовок модального окна
export const ModalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

// Кнопка закрытия модального окна
export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: '#FF6428',
  padding: theme.spacing(0.5),
}));

// Кнопка в модальном окне
export const ModalButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF6428',
  color: theme.palette.common.white,
  borderRadius: '6px',
  padding: theme.spacing(0.75, 2),
  fontSize: '0.875rem',
  '&:hover': {
    backgroundColor: '#d15321',
  },
}));

// Контейнер для кнопок в модальном окне
export const ModalButtonWrapper = styled(Box)(({ theme }) => ({
  alignSelf: 'flex-end',
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

// Сообщение об ошибке
export const ErrorAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
}));