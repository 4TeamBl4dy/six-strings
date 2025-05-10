import { createTheme } from "@mui/material/styles";

export const demoTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#FF6428', // Оранжевый вместо синего
        contrastText: '#fff', // Белый текст на оранжевом фоне
      },
      background: {
        default: '#fff', // Белый фон
        paper: '#fff', // Белый фон для боковой панели
      },
      text: {
        primary: '#000', // Чёрный текст для основного контента
        secondary: '#666', // Серый для второстепенного текста
      },
    },
    components: {
      // Настройка стилей боковой панели для активных элементов
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#fff', // Белый фон боковой панели
          },
        },
      },
    },
    cssVariables: {
      colorSchemeSelector: 'data-toolpad-color-scheme',
    },
  });