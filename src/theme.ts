import {createTheme} from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6428',
      light: '#ff7038',
      dark: '#e85b24'
    },
    secondary: {
      main: '#F2F2F7',
      dark: '#d9d9de',
      light: '#D0D0E6'
    },
    info: {
      main: '#F1D1FF',
      dark: '#d9bce6'
    },
    error: {
      main: '#FF7575',
      dark: '#de6666'
    },
    success: {
      main: '#72AC3C',
      light: '#E3FFE1',
      dark: '#59842EFF'
    }
  }
})