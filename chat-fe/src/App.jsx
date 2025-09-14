import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import MainChatPage from './pages/MainChatPage.jsx'; // New main chat page
import { Box } from '@mui/material';
import SessionTimer from './components/SessionTimer';
import SessionRenewalModal from './components/SessionRenewalModal';
import SessionExpiredModal from './components/SessionExpiredModal';

function PrivateRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return null;
  return user ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) return null;
  return user ? <Navigate to="/chat" /> : children;
}

function AppContent() {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <SessionTimer />
      <SessionRenewalModal />
      <SessionExpiredModal />
      <Routes>
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/chat" element={<PrivateRoute><MainChatPage /></PrivateRoute>} />
        <Route path="/chat/room/:roomId" element={<PrivateRoute><MainChatPage /></PrivateRoute>} />
      </Routes>
    </Box>
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