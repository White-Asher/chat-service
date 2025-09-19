/**
 * @file WelcomePanel.jsx
 * @description 이 파일은 채팅방이 선택되지 않았을 때 표시되는 WelcomePanel 컴포넌트를 포함한다.
 * 사용자에게 환영 메시지와 지침을 제공한다.
 * 
 * @requires react
 * @requires @mui/material
 * @requires @mui/icons-material/Chat
 */

import React from 'react';

// MUI 컴포넌트
import { Box, Typography } from '@mui/material';

// MUI 아이콘
import ChatIcon from '@mui/icons-material/Chat';

/**
 * @component WelcomePanel
 * @description 채팅방이 선택되지 않았을 때 표시되는 환영 패널 컴포넌트
 */
function WelcomePanel() {
  // JSX 렌더링
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