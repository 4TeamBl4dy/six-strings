import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './styles.css'
import {theme} from 'src/theme'
import { ModalWindowProps } from 'src/types';

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
            src={guitar.img}
            alt={guitar.name}
          />
          <Box className="ModalInfo">
            <Typography id="modal-title" variant="h6" component="h2">
              {guitar.name}
            </Typography>
            <Typography sx={{color: theme.palette.primary.main}}>{guitar.seller.login}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography fontSize={'17px'} fontWeight={600}>Цена:</Typography>
              <Typography sx={{mt: 0.2}}>{guitar.cost}тг</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography fontSize={'17px'} fontWeight={600}>В наличии:</Typography>
              <Typography sx={{mt: 0.2}}>{guitar.amount}шт</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography fontSize={'17px'} fontWeight={600}>Бренд:</Typography>
              <Typography sx={{mt: 0.2}}>{guitar.brand}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography fontSize={'17px'} fontWeight={600}>Тип:</Typography>
              <Typography sx={{mt: 0.2}}>{guitar.type}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography fontSize={'17px'} fontWeight={600}>Описание:</Typography>
              <Typography sx={{mt: 0.2}}>{guitar.description}</Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}