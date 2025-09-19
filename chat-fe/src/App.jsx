/**
 * @file App.jsx
 * @description 이 파일은 라우팅을 설정하고 사용자 컨텍스트를 제공하는 메인 애플리케이션 파일이다.
 * 인증된 사용자가 채팅 기능에 접근할 수 있도록 하고, 인증되지 않은 사용자는 로그인으로 리디렉션되도록 공용 및 비공개 라우트를 정의한다.
 * 
 * @requires react
 * @requires react-router-dom
 * @requires ./context/UserContext.jsx
 * @requires ./pages/LoginPage.jsx
 * @requires ./pages/SignUpPage.jsx
 * @requires ./pages/MainChatPage.jsx
 * @requires @mui/material
 * @requires ./components/SessionTimer
 * @requires ./components/SessionRenewalModal
 * @requires ./components/SessionExpiredModal
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 사용자 컨텍스트 및 관련 훅
import { UserProvider, useUser } from './context/UserContext.jsx';

// 페이지 컴포넌트
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import MainChatPage from './pages/MainChatPage.jsx';

// MUI 컴포넌트
import { Box } from '@mui/material';

// 세션 관련 모달 컴포넌트
import SessionTimer from './components/SessionTimer'; // 사용되지 않지만, 세션 관리에 필요할 수 있음
import SessionRenewalModal from './components/SessionRenewalModal';
import SessionExpiredModal from './components/SessionExpiredModal';

/**
 * @component PrivateRoute
 * @description 인증된 사용자만 접근할 수 있는 라우트 컴포넌트
 * 사용자가 로그인되어 있지 않으면 로그인 페이지로 리디렉션
 * @param {object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 렌더링할 자식 컴포넌트
 */
function PrivateRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return null; // 사용자 정보 로딩 중에는 아무것도 렌더링하지 않음
  return user ? children : <Navigate to="/" />;
}

/**
 * @component PublicRoute
 * @description 인증되지 않은 사용자만 접근할 수 있는 라우트 컴포넌트
 * 사용자가 로그인되어 있으면 채팅 페이지로 리디렉션
 * @param {object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 렌더링할 자식 컴포넌트
 */
function PublicRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return null; // 사용자 정보 로딩 중에는 아무것도 렌더링하지 않음
  return user ? <Navigate to="/chat" /> : children;
}

/**
 * @component AppContent
 * @description 애플리케이션의 주요 콘텐츠를 렌더링하고 라우팅을 설정하는 컴포넌트
 * 세션 갱신 및 만료 모달을 포함
 */
function AppContent() {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* 세션 갱신 및 만료 모달 */}
      <SessionRenewalModal />
      <SessionExpiredModal />
      {/* 라우트 정의 */}
      <Routes>
        {/* 로그인 페이지 (인증되지 않은 사용자만 접근) */}
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        {/* 회원가입 페이지 (인증되지 않은 사용자만 접근) */}
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        {/* 메인 채팅 페이지 (인증된 사용자만 접근) */}
        <Route path="/chat" element={<PrivateRoute><MainChatPage /></PrivateRoute>} />
        {/* 특정 채팅방 페이지 (인증된 사용자만 접근) */}
        <Route path="/chat/room/:roomId" element={<PrivateRoute><MainChatPage /></PrivateRoute>} />
      </Routes>
    </Box>
  );
}

/**
 * @component App
 * @description 애플리케이션의 최상위 컴포넌트
 * UserProvider로 전체 애플리케이션을 감싸 사용자 컨텍스트를 제공하고,
 * BrowserRouter로 라우팅을 설정
 */
function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
