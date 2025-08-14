import { createTheme } from '@mui/material/styles';

// Crear tema de la aplicacion
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f9fafb',
    },
  },
});

export default theme;