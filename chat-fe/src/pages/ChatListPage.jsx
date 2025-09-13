import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getChatRoomsByUserId } from '../api';
import CreateRoomModal from '../components/CreateRoomModal';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Fab,
  Box,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';

function ChatListPage() {
  const { user, logout } = useUser();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await getChatRoomsByUserId(user.userId);
        setRooms(response.data);
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRooms();
    }
  }, [user]);

  const handleEnterRoom = (roomId) => {
    navigate(`/chat/room/${roomId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {user?.userNickname}님의 채팅 목록
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="로그아웃">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <List sx={{ mt: 2 }}>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <ListItem key={room.roomId} disablePadding>
              <ListItemButton onClick={() => handleEnterRoom(room.roomId)}>
                <ListItemText
                  primary={room.roomName || '1:1 채팅'}
                  secondary={`참여자: ${room.participants.length}명`}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>
            참여중인 채팅방이 없습니다.
          </Typography>
        )}
      </List>
      
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setIsModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      <CreateRoomModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={user}
      />
    </>
  );
}

export default ChatListPage;
