import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// 모던한 다크 테마 적용
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7289da', // Discord-like purple/blue
    },
    background: {
      default: '#36393f', // Discord dark background
      paper: '#2f3136',   // Discord lighter background for elements
    },
    text: {
      primary: '#ffffff',
      secondary: '#b9bbbe', // Discord greyish text
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(114, 137, 218, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(114, 137, 218, 0.4)',
            }
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
);