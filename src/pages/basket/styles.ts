// styles/BasketStyled.ts
import { styled } from '@mui/material/styles';
import { Box, Typography, Button, IconButton } from '@mui/material';

export const BasketContainer = styled(Box)(({ theme }) => ({
  padding: '20px',
}));

export const BasketTitle = styled(Typography)(({ theme }) => ({
  color: '#FF6428',
  textAlign: 'center',
  marginBottom: '20px',
}));

export const GuitarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  margin: '20px 0',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  minHeight: '150px', 
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
  },
}));

export const GuitarImage = styled('img')({
  width: '150px',
  height: '150px',
  objectFit: 'cover',
});

export const CountButton = styled(Button)({
  background: 'none',
  border: 'none',
  fontSize: '30px',
  opacity: 0.5,
  minWidth: 'unset',
  width: '40px',
  height: '40px',
  '&:hover': {
    opacity: 1,
    background: 'none',
  },
});

export const CountText = styled(Typography)({
  fontSize: '18px',
  margin: '0 10px',
});

export const BasketFooter = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  backgroundColor: '#fff',
  borderTop: '2px solid #666',
  padding: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 10,
  marginTop: '40px',
}));

export const BasketWrapper = styled(Box)(({ theme }) => ({
  paddingBottom: '100px',
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  },
}));

export const Title = styled(Typography)(({ theme }) => ({
  color: '#FF6428',
  textAlign: 'center',
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: theme.spacing(4),
}));

export const GuitarBasket = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  margin: `${theme.spacing(5)} 0`,
}));

export const BasketImg = styled('img')(({ theme }) => ({
  width: '150px',
  height: '150px',
  objectFit: 'cover',
}));

export const ChangeCountButton = styled('button')(() => ({
  background: 'none',
  border: 'none',
  fontSize: '40px',
  opacity: 0.5,
  cursor: 'pointer',
  transition: '0.5s',
  '&:hover': {
    opacity: 1,
  },
}));

export const Count = styled('nav')(({ theme }) => ({
  fontSize: '20px',
}));

export const DeleteButton = styled('button')(() => ({
  background: 'none',
  border: 'none',
  width: '30px',
  height: '30px',
  cursor: 'pointer',
}));

export const DeleteAllButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.error.main,
}));

export const BasketEnd = styled(Box)(({ theme }) => ({
  position: 'fixed',
  backgroundColor: 'white',
  width: '100%',
  bottom: 0,
  padding: '20px 0 0 0',
  fontSize: '20px',
  borderTop: '2px solid #666666',
  textAlign: 'end',
}));

export const TotalText = styled('nav')(({ theme }) => ({
  marginRight: theme.spacing(2.5),
}));

export const BuyButton = styled(Button)(({ theme }) => ({
  width: '160px',
  padding: theme.spacing(1.25),
  backgroundColor: '#FF6428',
  color: 'white',
  borderRadius: '5px',
  fontSize: '14px',
  margin: `20px 20px 0 0`,
  transition: '0.4s',
  '&:hover': {
    backgroundColor: '#bf4e21',
  },
  '&:active': {
    backgroundColor: '#993e1a',
  },
}));

export const GuitarName = styled(Typography)(({ theme }) => ({
  maxWidth: '200px',
  wordBreak: 'break-word',
  lineHeight: 1.3,
}));
