/**
 * @file ChatListPanel.jsx
 * @description 이 파일은 채팅 목록 패널을 렌더링하는 ChatListPanel 컴포넌트를 포함한다.
 * 이 컴포넌트는 MainChatPage 컴포넌트에서 사용된다.
 * 사용자의 채팅방, 친구를 표시하고 새 채팅방 생성, 사용자 닉네임 업데이트, 로그아웃 기능을 제공한다.
 * 
 * @requires react
 * @requires react-router-dom
 * @requires ../context/UserContext
 * @requires ../api
 * @requires ./CreateRoomModal
 * @requires ./UpdateNicknameModal
 * @requires ./InfoModal
 * @requires ./ConfirmModal
 * @requires ./SessionTimer
 * @requires ./FriendsPanel
 * @requires @mui/material
 * @requires @mui/icons-material/Add
 * @requires @mui/icons-material/Logout
 * @requires @mui/icons-material/ExitToApp
 * @requires @mui/icons-material/Edit
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 사용자 정보 컨텍스트
import { useUser } from '../context/UserContext';

// API 호출 함수
import { getChatRoomsByUserId, leaveChatRoom, updateNickname } from '../api';

// 하위 컴포넌트들
import CreateRoomModal from './CreateRoomModal';
import UpdateNicknameModal from './UpdateNicknameModal';
import InfoModal from './InfoModal';
import ConfirmModal from './ConfirmModal';
import SessionTimer from './SessionTimer';
import FriendsPanel from './FriendsPanel';

// MUI 컴포넌트
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Button,
  Tabs,
  Tab,
} from '@mui/material';

// MUI 아이콘
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';

/**
 * @component ChatListPanel
 * @description 채팅 목록과 친구 목록을 보여주는 좌측 패널 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {string} props.selectedRoomId - 현재 선택된 채팅방 ID
 */
function ChatListPanel({ selectedRoomId }) {
  // 사용자 정보, 로그아웃, 사용자 정보 업데이트 함수
  const { user, logout, updateUser } = useUser();

  // 컴포넌트 상태 변수들
  const [rooms, setRooms] = useState([]); // 채팅방 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false); // 채팅방 생성 모달 열림/닫힘 상태
  const [isNicknameModalOpen, setNicknameModalOpen] = useState(false); // 닉네임 변경 모달 열림/닫힘 상태
  const [isInfoModalOpen, setInfoModalOpen] = useState(false); // 정보 모달 열림/닫힘 상태
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' }); // 정보 모달 내용
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false); // 확인 모달 열림/닫힘 상태
  const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '', onConfirm: () => {} }); // 확인 모달 내용
  const [tab, setTab] = useState(0); // 현재 선택된 탭 (0: 채팅, 1: 친구)
  const navigate = useNavigate(); // 라우터 네비게이션

  /**
   * @function showInfoModal
   * @description 정보 모달을 표시하는 함수
   * @param {string} title - 모달 제목
   * @param {string} message - 모달 내용
   */
  const showInfoModal = (title, message) => {
    setInfoModalContent({ title, message });
    setInfoModalOpen(true);
  };

  // 사용자 정보가 변경될 때마다 채팅방 목록을 다시 불러옴
  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await getChatRoomsByUserId(user.userId);
        setRooms(response.data);
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [user]);

  /**
   * @function handleEnterRoom
   * @description 채팅방에 입장하는 함수
   * @param {string} roomId - 입장할 채팅방 ID
   */
  const handleEnterRoom = (roomId) => {
    navigate(`/chat/room/${roomId}`);
  };

  /**
   * @function handleLogout
   * @description 로그아웃 처리 함수
   */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /**
   * @function handleUpdateNickname
   * @description 닉네임 변경 처리 함수
   * @param {string} newNickname - 새로운 닉네임
   */
  const handleUpdateNickname = async (newNickname) => {
    try {
      const response = await updateNickname(newNickname);
      updateUser(response.data); // 컨텍스트의 사용자 정보 업데이트
      setNicknameModalOpen(false);
      showInfoModal('성공', '닉네임이 변경되었습니다.');
    } catch (error) {
      console.error("Failed to update nickname:", error);
      showInfoModal('오류', error.response?.data?.message || '닉네임 변경에 실패했습니다.');
    }
  };

  /**
   * @function handleLeaveRoom
   * @description 채팅방 나가기 처리 함수
   * @param {Event} e - 이벤트 객체
   * @param {string} roomId - 나갈 채팅방 ID
   * @param {string} roomName - 나갈 채팅방 이름
   */
  const handleLeaveRoom = (e, roomId, roomName) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setConfirmModalContent({
      title: '채팅방 나가기',
      message: `'${roomName}' 채팅방을 정말 나가시겠습니까?`,
      onConfirm: async () => {
        try {
          await leaveChatRoom(roomId);
          const newRooms = rooms.filter((room) => room.roomId !== roomId);
          setRooms(newRooms);
          showInfoModal('성공', `'${roomName}' 채팅방에서 나갔습니다.`);
          // 현재 보고 있는 채팅방에서 나갔을 경우, 채팅방 목록으로 이동
          if (selectedRoomId === String(roomId)) {
            navigate('/chat');
          }
        } catch (error) {
          console.error('Failed to leave chat room:', error);
          showInfoModal('오류', '채팅방을 나가는 데 실패했습니다.');
        }
      }
    });
    setConfirmModalOpen(true);
  };

  /**
   * @function handleRoomCreated
   * @description 채팅방 생성 완료 후 처리 함수
   * @param {string} newRoomId - 새로 생성된 채팅방 ID
   */
  const handleRoomCreated = (newRoomId) => {
    setCreateRoomModalOpen(false);
    // 채팅방 목록을 다시 불러오고 새로 생성된 채팅방으로 이동
    const fetchRooms = async () => {
        const response = await getChatRoomsByUserId(user.userId);
        setRooms(response.data);
    };
    fetchRooms();
    navigate(`/chat/room/${newRoomId}`);
  };

  // JSX 렌더링
  return (
    <>
      <Box sx={{
        width: '320px',
        height: '100%',
        bgcolor: '#2f3136',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #40444b'
      }}>
        {/* 상단 사용자 정보 및 로그아웃 버튼 */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{user?.userNickname}</Typography>
            <IconButton size="small" onClick={() => setNicknameModalOpen(true)} title="닉네임 변경" sx={{ ml: 0.5 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          <IconButton onClick={handleLogout} title="로그아웃">
            <LogoutIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: '#40444b' }} />
        {/* 채팅/친구 탭 */}
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth">
            <Tab label="Chats" />
            <Tab label="Friends" />
        </Tabs>
        {tab === 0 ? (
          // 채팅 탭
          <>
            <Box sx={{ p: 1 }}>
              <Button fullWidth variant="outlined" onClick={() => setCreateRoomModalOpen(true)} startIcon={<AddIcon />}>
                새 채팅 시작하기
              </Button>
            </Box>
            <Divider sx={{ borderColor: '#40444b' }} />
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
              ) : rooms.length > 0 ? (
                rooms.map((room) => (
                  <ListItem key={room.roomId} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleEnterRoom(room.roomId)}
                      selected={selectedRoomId === String(room.roomId)}
                    >
                      <ListItemText
                        primary={room.roomName || '1:1 채팅'}
                        secondary={`참여자: ${room.participants.length}명`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                       <IconButton
                          edge="end"
                          aria-label="leave"
                          onClick={(e) => handleLeaveRoom(e, room.roomId, room.roomName)}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          <ExitToAppIcon fontSize="small" />
                        </IconButton>
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                  참여중인 채팅방이 없습니다.
                </Typography>
              )}
            </List>
          </>
        ) : (
            // 친구 탭
            <FriendsPanel />
        )}
      </Box>
      {/* 모달 컴포넌트들 */}
      <CreateRoomModal
        open={isCreateRoomModalOpen}
        onClose={() => setCreateRoomModalOpen(false)}
        currentUser={user}
        onRoomCreated={handleRoomCreated}
      />
      <UpdateNicknameModal
        open={isNicknameModalOpen}
        onClose={() => setNicknameModalOpen(false)}
        currentNickname={user?.userNickname}
        onSave={handleUpdateNickname}
      />
      <InfoModal
        open={isInfoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title={infoModalContent.title}
        message={infoModalContent.message}
      />
      <ConfirmModal
        open={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmModalContent.onConfirm}
        title={confirmModalContent.title}
        message={confirmModalContent.message}
      />
    </>
  );
}

export default ChatListPanel;