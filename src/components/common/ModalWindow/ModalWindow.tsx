import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './styles.css'
import {theme} from 'src/theme'

// Тип для объекта гитары
interface Guitar {
  _id: string;
  img: string;
  name: string;
  cost: number;
  amount: number;
  brand?: string;
  type?: string;
  description?: string;
  seller: {
    login: string;
    name: string;
    phone: string;
  };
}

// Тип для пропсов компонента
interface ModalWindowProps {
  guitar: Guitar;
}

export const ModalWindow = ({ guitar }: ModalWindowProps) => {
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  return (
    <div>
      <button
        className="more"
        onClick={() => setModalIsOpen(true)}
      >
        Подробнее»
      </button>
      <Modal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxWidth: 500,
            width: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
          className="ModalWindow"
        >
          <button
            className="cross"
            onClick={() => setModalIsOpen(false)}
          >
            <CloseIcon sx={{cursor: ''}} />
          </button>
          <img
            className="ModalImg"
            src={`/items_pictures/${guitar.img}.png`}
            alt={guitar.name}
          />
          <Box className="ModalInfo">
            <Typography id="modal-title" variant="h5" component="h2">
              {guitar.name}
            </Typography>
            <Typography sx={{color: theme.palette.primary.main}}>{guitar.seller.login}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="h6">Цена:</Typography>
              <Typography sx={{mt: 0.7}}>{guitar.cost}тг</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="h6">В наличии:</Typography>
              <Typography sx={{mt: 0.7}}>{guitar.amount}шт</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="h6">Бренд:</Typography>
              <Typography sx={{mt: 0.7}}>{guitar.brand}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="h6">Тип:</Typography>
              <Typography sx={{mt: 0.7}}>{guitar.type}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="h6">Описание:</Typography>
              <Typography sx={{mt: 0.7}}>{guitar.description}</Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}