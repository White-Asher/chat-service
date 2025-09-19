/**
 * @file MainChatPage.jsx
 * @description 이 파일은 채팅 애플리케이션의 메인 레이아웃 역할을 하는 MainChatPage 컴포넌트를 포함한다.
 * 왼쪽에는 채팅 목록 패널을, 오른쪽에는 특정 채팅방 또는 환영 패널을 표시한다.
 * 
 * @requires react
 * @requires react-router-dom
 * @requires @mui/material
 * @requires ../components/ChatListPanel
 * @requires ../components/ChatRoomPanel
 * @requires ../components/WelcomePanel
 */

import React from 'react';
import { useParams } from 'react-router-dom';

// MUI 컴포넌트
import { Box } from '@mui/material';

// 하위 컴포넌트들
import ChatListPanel from '../components/ChatListPanel';
import ChatRoomPanel from '../components/ChatRoomPanel';
import WelcomePanel from '../components/WelcomePanel';

/**
 * @component MainChatPage
 * @description 채팅 애플리케이션의 메인 페이지 컴포넌트
 * 좌측에는 채팅방 목록/친구 목록을, 우측에는 선택된 채팅방 또는 환영 메시지를 표시
 */
function MainChatPage() {
  // URL 파라미터에서 roomId를 가져옴
  const { roomId } = useParams();

  // JSX 렌더링
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* 좌측 채팅 목록 패널 */}
      <ChatListPanel selectedRoomId={roomId} />
      {/* 우측 채팅방 또는 환영 패널 */}
      <Box sx={{ flexGrow: 1, height: '100%' }}>
        {/* roomId가 있으면 ChatRoomPanel을, 없으면 WelcomePanel을 렌더링 */}
        {roomId ? <ChatRoomPanel key={roomId} roomId={roomId} /> : <WelcomePanel />}
      </Box>
    </Box>
  );
}

export default MainChatPage;