import { styled } from '@mui/material/styles';
import { Box, Container, Typography, Button, Card, CardMedia, CardContent, Grid, Modal, Alert, IconButton } from '@mui/material';

export const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingInline: theme.spacing(2),
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  textAlign: 'left',
  marginBottom: theme.spacing(2),
  color: '#FF6428',
  fontSize: '1.25rem',
}));

export const ToolbarWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(4),
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

export const ProductsGrid = styled(Grid)(({ theme }) => ({
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  alignItems: 'stretch',
  rowSpacing: theme.spacing(3),
  columnSpacing: theme.spacing(2),
  spacing: 2,
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    rowSpacing: theme.spacing(2),
  },
}));

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

export const ModalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: '#FF6428',
  padding: theme.spacing(0.5),
}));

export const ModalButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF6428',
  color: theme.palette.common.white,
  borderRadius: '6px',
  padding: theme.spacing(0.75, 2),
  px: 0.5,
  fontSize: '12px',
  '&:hover': {
    backgroundColor: '#d15321',
  },
}));

export const ModalButtonWrapper = styled(Box)(({ theme }) => ({
  alignSelf: 'flex-end',
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

export const ErrorAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
}));