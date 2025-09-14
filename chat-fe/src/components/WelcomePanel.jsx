import React from 'react';
import { Box, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

function WelcomePanel() {
  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'text.secondary',
      textAlign: 'center',
      p: 3
    }}>
      <ChatIcon sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h5" component="h2" gutterBottom>
        채팅을 시작해보세요!
      </Typography>
      <Typography variant="body1">
        왼쪽 목록에서 채팅방을 선택하거나 새 채팅방을 만들어 대화를 시작하세요.
      </Typography>
    </Box>
  );
}

export default WelcomePanel;
