import { Box, Avatar, Button, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout'; // Исправляем название иконки

interface User {
  name: string;
  email: string;
}

interface SidebarFooterProfileProps {
  user: User | null;
  onLogout: () => void;
}

export const SidebarFooterProfile = ({ user, onLogout }: SidebarFooterProfileProps) => {
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
          alt={user?.name || 'User'}
          src="/broken-image.jpg" // Можно заменить на реальное изображение пользователя
        >
          {user?.name ? user.name[0] : 'U'}
        </Avatar>
        <Typography variant="body1">{user?.name || 'Пользователь'}</Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<LogoutIcon />}
        onClick={onLogout}
        sx={{ backgroundColor: '#FF6428', '&:hover': { backgroundColor: '#e55a22' } }}
      >
        Выйти
      </Button>
    </Box>
  );
};