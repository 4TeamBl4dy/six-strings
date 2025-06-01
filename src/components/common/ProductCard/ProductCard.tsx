import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, IconButton, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

import { Guitar } from 'src/types';
import { ROUTES } from 'src/constants';
import { theme } from 'src/theme'; // Assuming theme is directly importable

// Child components that will be used (ensure they are correctly imported if used)
import { BasketBtn, FavoriteBtn, ModalWindow } from 'src/components';
// For seller-specific actions, we might need props for edit/delete handlers
// For now, ModalWindow is the common "details" action.

export type ProductCardActionType = 'customer' | 'sellerOwn' | 'sellerViewOther' | 'none';

interface ProductCardProps {
  guitar: Guitar;
  actionType?: ProductCardActionType;
  onEdit?: (guitar: Guitar) => void; // For seller "Edit"
  onDelete?: (guitarId: string) => void; // For seller "Delete"
}

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%', // Will be controlled by Grid item's sizing
  maxWidth: 240, // Max width for the card itself
  minWidth: 200,
  height: 380, // Standardized height
  borderRadius: theme.spacing(2), // 16px
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxShadow: theme.shadows[2],
  transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-4px)',
  },
  margin: 'auto', // Center in grid cell if cell is wider
}));

const StyledCardMedia = styled(CardMedia)({
  height: 180, // Standardized image height
  objectFit: 'contain', // Show whole guitar, adjust as needed
  padding: theme.spacing(1), // Some padding around the image
});

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2), // 16px
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between', // Pushes actions to bottom if content is short
  overflow: 'hidden', // Prevent content spill
}));

const ProductName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.5),
}));

const SellerLink = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
  fontSize: '0.875rem',
  marginBottom: theme.spacing(1),
}));

const PriceTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const StockStatus = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  height: '1.2em', // Reserve space even if not shown to prevent layout shift
}));


const ActionsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around', // Evenly space out customer buttons
  alignItems: 'center',
  paddingTop: theme.spacing(1),
  gap: theme.spacing(1), // Gap between buttons
}));

// Specific button for seller actions, reusing ModalButton style from catalog/styles.ts concept
const SellerActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: '6px',
  padding: theme.spacing(0.5, 1.5),
  fontSize: '0.75rem',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));


export const ProductCard: React.FC<ProductCardProps> = ({ guitar, actionType = 'customer', onEdit, onDelete }) => {
  const sellerProfileLink = `${ROUTES.SALER_PRODUCTS}?seller=${guitar.seller.login}`;

  return (
    <StyledCard>
      <StyledCardMedia
        component="img"
        image={guitar.img}
        alt={guitar.name}
      />
      <StyledCardContent>
        <Box> {/* Top content section */}
          <ProductName variant="subtitle1">
            {guitar.name}
          </ProductName>
          {actionType === 'customer' && (
            <SellerLink component={RouterLink} to={sellerProfileLink} variant="body2">
              {guitar.seller.login}
            </SellerLink>
          )}
          <PriceTypography variant="h6">
            {guitar.cost} ₸
          </PriceTypography>
          {guitar.amount > 0 ? (
            <StockStatus variant="caption" color="success.dark">
              В наличии: {guitar.amount} шт.
            </StockStatus>
          ) : (
            <StockStatus variant="caption" color="error.main">
              Нет в наличии
            </StockStatus>
          )}
        </Box>

        <ActionsBox>
          {actionType === 'customer' && (
            <>
              <BasketBtn guitar={guitar} />
              <FavoriteBtn guitar={guitar} />
              <ModalWindow guitar={guitar} />
            </>
          )}
          {actionType === 'sellerOwn' && onEdit && onDelete && (
            <>
              <SellerActionButton size="small" onClick={() => onEdit(guitar)}>Изменить</SellerActionButton>
              <Button size="small" color="error" onClick={() => onDelete(guitar._id)}>Удалить</Button>
              <ModalWindow guitar={guitar} />
            </>
          )}
          {actionType === 'sellerViewOther' && (
            <ModalWindow guitar={guitar} />
          )}
          {/* 'none' actionType renders no buttons in ActionsBox */}
        </ActionsBox>
      </StyledCardContent>
    </StyledCard>
  );
};
