import React, { useState } from 'react';
import { Modal, Box, Typography, Button, IconButton, Grid, CardMedia } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { theme } from 'src/theme'; // Ensure theme is importable or access it via useTheme
import { Guitar } from 'src/types';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from 'src/constants';

// Assuming ModalWindowProps is defined elsewhere and provides 'guitar'
interface ModalWindowProps {
    guitar: Guitar;
}

const typeTranslations: { [key: string]: string } = {
  acoustic: 'Акустическая гитара',
  electric: 'Электрогитара',
  classical: 'Классическая гитара', // Corrected from 'Классическая гита'
  bass: 'Бас-гитара',
  combo: 'Комбоусилитель',
  accessories: 'Аксессуары'
};

export const ModalWindow = ({ guitar }: ModalWindowProps) => {
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const handleOpen = () => setModalIsOpen(true);
  const handleClose = () => setModalIsOpen(false);

  const translatedType = typeTranslations[guitar.type.toLowerCase()] || guitar.type;
  const sellerLink = `${ROUTES.SALER_PRODUCTS}?seller=${guitar.seller.login}`;

  return (
    <>
      <Button
        variant="text"
        size="small"
        onClick={handleOpen}
        sx={{
          color: 'text.secondary',
          p: 0.5,
          minWidth: 'auto',
          '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' }
        }}
      >
        Подробнее &raquo;
      </Button>
      <Modal open={modalIsOpen} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: theme.spacing(2), // Consistent 16px
            p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            maxWidth: { xs: '95%', sm: '80%', md: '700px' }, // Responsive max width
            width: '100%', // Ensures it doesn't exceed maxWidth
            maxHeight: '90vh',
            overflowY: 'auto',
            outline: 'none', // Remove focus outline from modal box itself
          }}
        >
          <IconButton
            aria-label="close modal"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: theme.spacing(1.5), // Adjusted for better spacing with padding
              right: theme.spacing(1.5), // Adjusted for better spacing with padding
              color: theme.palette.grey[500],
              '&:hover': {
                color: theme.palette.primary.main,
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 2 }}> {/* Added margin top for space below close button */}
            <Grid item xs={12} md={5}>
              <CardMedia
                component="img"
                image={guitar.img}
                alt={guitar.name}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: { xs: 250, md: 350 },
                  objectFit: 'contain',
                  borderRadius: theme.spacing(1),
                  mb: { xs: 2, md: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography id="modal-title" variant="h5" component="h2" fontWeight="600" gutterBottom>
                {guitar.name}
              </Typography>
              <Typography
                variant="subtitle1"
                color="primary.main"
                component={RouterLink}
                to={sellerLink}
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, display: 'block', mb: 2 }}
              >
                Продавец: {guitar.seller.login}
              </Typography>

              {guitar.amount === 0 && (
                <Typography variant="subtitle1" color="error.main" fontWeight="600" sx={{ mb: 2 }}>
                  Нет в наличии
                </Typography>
              )}

              <Box sx={{ mb: 1 }}>
                <Typography variant="body1" component="span" fontWeight="600">Цена: </Typography>
                <Typography variant="body1" component="span">{guitar.cost} ₸</Typography>
              </Box>
              {guitar.amount > 0 && ( // Only show if in stock
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body1" component="span" fontWeight="600">В наличии: </Typography>
                  <Typography variant="body1" component="span">{guitar.amount} шт.</Typography>
                </Box>
              )}
              <Box sx={{ mb: 1 }}>
                <Typography variant="body1" component="span" fontWeight="600">Бренд: </Typography>
                <Typography variant="body1" component="span">{guitar.brand || 'Не указан'}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body1" component="span" fontWeight="600">Тип: </Typography>
                <Typography variant="body1" component="span">{translatedType}</Typography>
              </Box>

              <Typography variant="body1" fontWeight="600" sx={{ mt: 2, mb: 0.5 }}>
                Описание:
              </Typography>
              <Typography id="modal-description" variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                {guitar.description || 'Описание отсутствует.'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};
