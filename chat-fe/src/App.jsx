import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx'; // SignUpPage import 추가
import ChatListPage from './pages/ChatListPage.jsx';
import ChatRoomPage from './pages/ChatRoomPage.jsx';
import { Container } from '@mui/material';

// 로그인 상태에 따라 접근을 제어하는 PrivateRoute 컴포넌트
function PrivateRoute({ children }) {
  const { user } = useUser();
  // user 정보가 없으면 로그인 페이지로 리다이렉트
  return user ? children : <Navigate to="/" />;
}

// 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하는 것을 막는 PublicRoute
function PublicRoute({ children }) {
    const { user } = useUser();
    return user ? <Navigate to="/chat" /> : children;
}


function App() {
  return (
    <UserProvider>
      <Router>
        <Container maxWidth="lg" sx={{ mt: 1, mb: 1, height: '98vh' }}>
          <Routes>
            {/* 로그인/회원가입 경로는 로그인 안 한 사용자만 접근 가능 */}
            <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />

            {/* 채팅 관련 경로는 로그인한 사용자만 접근 가능 */}
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat/room/:roomId"
              element={
                <PrivateRoute>
                  <ChatRoomPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Container>
      </Router>
    </UserProvider>
  );
}

export default App;
