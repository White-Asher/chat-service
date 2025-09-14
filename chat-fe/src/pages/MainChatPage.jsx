import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import ChatListPanel from '../components/ChatListPanel';
import ChatRoomPanel from '../components/ChatRoomPanel';
import WelcomePanel from '../components/WelcomePanel';

function MainChatPage() {
  const { roomId } = useParams();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
      <ChatListPanel selectedRoomId={roomId} />
      <Box sx={{ flexGrow: 1, height: '100%' }}>
        {roomId ? <ChatRoomPanel key={roomId} roomId={roomId} /> : <WelcomePanel />}
      </Box>
    </Box>
  );
}

export default MainChatPage;
