import { Box, Avatar, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'src/constants';
import { SalerPublicProfile } from '../../../../types/saler'; // Adjusted import path
import { SidebarFooterProfileProps } from '../../../../types/props'; // Adjusted import path

export const SidebarFooterProfile = ({ user, onLogout, refreshUser }: SidebarFooterProfileProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(ROUTES.SALER_PROFILE);
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fff',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{ bgcolor: '#FF6428' }}
          alt={user?.login || 'User'}
          src={user?.img || '/broken-image.jpg'}
        >
          {user?.login ? user.login[0] : 'U'}
        </Avatar>
        <Box>
          <Typography variant="body1">{user?.login || 'Пользователь'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.phone || 'Телефон не указан'}
          </Typography>
        </Box>
      </Box>
      <IconButton
        onClick={handleMenuOpen}
        sx={{ color: '#FF6428' }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>Редактировать</MenuItem>
        <MenuItem onClick={() => { onLogout(); handleMenuClose(); }}>Выйти</MenuItem>
      </Menu>
    </Box>
  );
};