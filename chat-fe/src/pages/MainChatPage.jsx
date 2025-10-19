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

import React, { useState } from 'react'; // useState import
import { useParams } from 'react-router-dom';

// MUI 컴포넌트
import { Box, Button } from '@mui/material'; // Button import

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
  const { roomId } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [serverResponse, setServerResponse] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setServerResponse('');
  };

  const handleUpload = async (endpoint) => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }
    setServerResponse('Uploading...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // API 서버 주소는 8081 포트로 가정합니다.
      const response = await fetch(`http://localhost:8081${endpoint}`, {
        method: 'POST',
        body: formData,
        // CORS와 쿠키 설정을 위해 credentials 포함
        credentials: 'include',
      });
      const text = await response.text();
      setServerResponse(text);
    } catch (error) {
      setServerResponse(`Error: ${error.message}`);
    }
  };

  // Command Injection 테스트용 패널 컴포넌트
  const MediaUploadPanel = () => (
    <Box sx={{ p: 2, borderTop: '1px solid #ccc', backgroundColor: '#fafafa' }}>
      <h3>Command Injection Test (FFmpeg)</h3>
      <p style={{color: 'red', fontWeight: 'bold'}}>
        주의: 이 기능을 테스트하려면 백엔드 서버가 실행되는 컴퓨터에 FFmpeg이 설치되어 있고, 시스템 PATH에 등록되어 있어야 합니다.
      </p>
      <input type="file" onChange={handleFileChange} accept="video/*,image/*" />
      <Box sx={{ mt: 1 }}>
        <Button variant="contained" color="error" onClick={() => handleUpload('/api/media/upload-vulnerable')} sx={{ mr: 1 }} disabled={!selectedFile}>
          Vulnerable Upload
        </Button>
        <Button variant="contained" color="success" onClick={() => handleUpload('/api/media/upload-secure')} disabled={!selectedFile}>
          Secure Upload
        </Button>
      </Box>
      {serverResponse && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', background: '#f0f0f0', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '200px', overflowY: 'auto' }}>
          <h4>Server Response:</h4>
          <pre>{serverResponse}</pre>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* 좌측 채팅 목록 패널 */}
      <ChatListPanel selectedRoomId={roomId} />
      {/* 우측 패널 (채팅방 + 업로드 패널) */}
      <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {/* roomId가 있으면 ChatRoomPanel을, 없으면 WelcomePanel을 렌더링 */}
          {roomId ? <ChatRoomPanel key={roomId} roomId={roomId} /> : <WelcomePanel />}
        </Box>
        {/* 하단 미디어 업로드 테스트 패널 */}
        <MediaUploadPanel />
      </Box>
    </Box>
  );
}

export default MainChatPage;