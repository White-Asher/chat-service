import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getChatRoomsByUserId, leaveChatRoom, updateNickname } from '../api';
import CreateRoomModal from './CreateRoomModal';
import UpdateNicknameModal from './UpdateNicknameModal';
import InfoModal from './InfoModal';
import ConfirmModal from './ConfirmModal';
import SessionTimer from './SessionTimer';
import FriendsPanel from './FriendsPanel';
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
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';

function ChatListPanel({ selectedRoomId }) {
  const { user, logout, updateUser } = useUser();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [isNicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' });
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '', onConfirm: () => {} });
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const showInfoModal = (title, message) => {
    setInfoModalContent({ title, message });
    setInfoModalOpen(true);
  };

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

  const handleEnterRoom = (roomId) => {
    navigate(`/chat/room/${roomId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUpdateNickname = async (newNickname) => {
    try {
      const response = await updateNickname(newNickname);
      updateUser(response.data);
      setNicknameModalOpen(false);
      showInfoModal('성공', '닉네임이 변경되었습니다.');
    } catch (error) {
      console.error("Failed to update nickname:", error);
      showInfoModal('오류', error.response?.data?.message || '닉네임 변경에 실패했습니다.');
    }
  };

  const handleLeaveRoom = (e, roomId, roomName) => {
    e.stopPropagation();
    setConfirmModalContent({
      title: '채팅방 나가기',
      message: `'${roomName}' 채팅방을 정말 나가시겠습니까?`,
      onConfirm: async () => {
        try {
          await leaveChatRoom(roomId);
          const newRooms = rooms.filter((room) => room.roomId !== roomId);
          setRooms(newRooms);
          showInfoModal('성공', `'${roomName}' 채팅방에서 나갔습니다.`);
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

  const handleRoomCreated = (newRoomId) => {
    setCreateRoomModalOpen(false);
    const fetchRooms = async () => {
        const response = await getChatRoomsByUserId(user.userId);
        setRooms(response.data);
    };
    fetchRooms();
    navigate(`/chat/room/${newRoomId}`);
  };

  return (
    <>
      <Box sx={{
        width: '320px',
        height: '100%',
        bgcolor: '#2f3136', // paper color
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #40444b'
      }}>
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
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth">
            <Tab label="Chats" />
            <Tab label="Friends" />
        </Tabs>
        {tab === 0 ? (
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
            <FriendsPanel />
        )}
      </Box>
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
