import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ChatListPage from './pages/ChatListPage.jsx';
import ChatRoomPage from './pages/ChatRoomPage.jsx';
import { Container } from '@mui/material';

function PrivateRoute({ children }) {
  const { user } = useUser();
  return user ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const { user } = useUser();
  return user ? <Navigate to="/chat" /> : children;
}

function AppContent() {
  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 1, height: '98vh' }}>
      <Routes>
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatListPage /></PrivateRoute>} />
        <Route path="/chat/room/:roomId" element={<PrivateRoute><ChatRoomPage /></PrivateRoute>} />
      </Routes>
    </Container>
  );
}

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
