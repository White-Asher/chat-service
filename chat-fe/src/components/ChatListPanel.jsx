import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getChatRoomsByUserId, leaveChatRoom } from '../api';
import CreateRoomModal from './CreateRoomModal';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

function ChatListPanel({ selectedRoomId }) {
  const { user, logout } = useUser();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleLeaveRoom = async (e, roomId, roomName) => {
    e.stopPropagation(); // Prevent ListItemButton's onClick
    if (window.confirm(`'${roomName}' 채팅방을 정말 나가시겠습니까?`)) {
      try {
        await leaveChatRoom(roomId);
        const newRooms = rooms.filter((room) => room.roomId !== roomId);
        setRooms(newRooms);
        alert(`'${roomName}' 채팅방에서 나갔습니다.`);
        // If the currently selected room is the one being left, navigate away
        if (selectedRoomId === String(roomId)) {
          navigate('/chat');
        }
      } catch (error) {
        console.error('Failed to leave chat room:', error);
        alert('채팅방을 나가는 데 실패했습니다.');
      }
    }
  };

  const handleRoomCreated = (newRoomId) => {
    setIsModalOpen(false);
    // Refetch rooms or add the new room to the list
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
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{user?.userNickname}</Typography>
          <IconButton onClick={handleLogout} title="로그아웃">
            <LogoutIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: '#40444b' }} />
        <Box sx={{ p: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => setIsModalOpen(true)} startIcon={<AddIcon />}>
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
      </Box>
      <CreateRoomModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={user}
        onRoomCreated={handleRoomCreated}
      />
    </>
  );
}

export default ChatListPanel;
