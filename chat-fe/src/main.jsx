/**
 * @file main.jsx
 * @description This is the entry point of the React application.
 * It renders the main App component, wrapped with Material-UI's ThemeProvider for consistent styling and CssBaseline for a clean slate.
 * 
 * @requires react
 * @requires react-dom/client
 * @requires ./App.jsx
 * @requires @mui/material
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Material-UI 컴포넌트 및 테마 관련 함수
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// 모던한 다크 테마 정의
const darkTheme = createTheme({
  palette: {
    mode: 'dark', // 다크 모드 활성화
    primary: {
      main: '#7289da', // 주요 색상 (Discord와 유사한 보라색/파란색)
    },
    background: {
      default: '#36393f', // 기본 배경색 (Discord 어두운 배경)
      paper: '#2f3136',   // 컴포넌트 배경색 (Discord 밝은 배경)
    },
    text: {
      primary: '#ffffff', // 기본 텍스트 색상
      secondary: '#b9bbbe', // 보조 텍스트 색상 (Discord 회색 텍스트)
    },
  },
  components: {
    // ListItemButton 컴포넌트의 스타일 오버라이드
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // 모서리 둥글게
          '&.Mui-selected': {
            backgroundColor: 'rgba(114, 137, 218, 0.3)', // 선택되었을 때 배경색
            '&:hover': {
              backgroundColor: 'rgba(114, 137, 218, 0.4)', // 선택된 상태에서 호버 시 배경색
            }
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)', // 호버 시 배경색
          }
        }
      }
    }
  }
});

// React 애플리케이션 렌더링
ReactDOM.createRoot(document.getElementById('root')).render(
  // Material-UI 테마 적용
  <ThemeProvider theme={darkTheme}>
    {/* CSS 초기화 및 일관된 스타일 적용 */}
    <CssBaseline />
    {/* 메인 애플리케이션 컴포넌트 */}
    <App />
  </ThemeProvider>,
);