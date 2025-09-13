import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// 기본 MUI 테마 설정
const theme = createTheme({
  palette: {
    mode: 'light', // 'dark' 모드로 변경 가능
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline: 브라우저 기본 CSS를 초기화하여 일관된 스타일 적용 */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
