import React, { useState, useEffect } from 'react';
import { createChatRoom, getFriendList } from '../api';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  FormControlLabel
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function CreateRoomModal({ open, onClose, currentUser, onRoomCreated }) {
  const [roomName, setRoomName] = useState('');
  const [userNicknames, setUserNicknames] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (open) {
      const fetchFriends = async () => {
        try {
          const response = await getFriendList();
          setFriends(response.data);
        } catch (error) {
          console.error('Failed to fetch friends:', error);
        }
      };
      fetchFriends();
    }
  }, [open]);

  const handleFriendToggle = (friend) => {
    const currentIndex = selectedFriends.findIndex(f => f.userId === friend.userId);
    const newSelectedFriends = [...selectedFriends];

    if (currentIndex === -1) {
      newSelectedFriends.push(friend);
    } else {
      newSelectedFriends.splice(currentIndex, 1);
    }

    setSelectedFriends(newSelectedFriends);
    setUserNicknames(newSelectedFriends.map(f => f.userNickname).join(', '));
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('채팅방 이름을 입력해주세요.');
      return;
    }
    const invitedUserNicknames = userNicknames.split(',').map(nickname => nickname.trim()).filter(nickname => nickname);

    if (invitedUserNicknames.length === 0) {
      alert('초대할 사용자의 닉네임을 1명 이상 입력해주세요.');
      return;
    }

    try {
      const roomData = {
        roomName,
        userNicknames: [currentUser.userNickname, ...invitedUserNicknames],
        roomType: 'GROUP',
      };
      const response = await createChatRoom(roomData);
      alert('채팅방이 생성되었습니다.');
      onClose();
      if (onRoomCreated) {
        onRoomCreated(response.data.roomId);
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
      const errorMessage = error.response?.data?.error || '채팅방 생성에 실패했습니다. 존재하지 않는 닉네임이 포함되어 있을 수 있습니다.';
      alert(errorMessage);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          새 그룹 채팅방 만들기
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          label="채팅방 이름"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>친구 목록</Typography>
        <List dense sx={{ width: '100%', maxHeight: 150, overflow: 'auto', bgcolor: 'background.paper' }}>
          {friends.map((friend) => (
            <ListItem key={friend.userId} dense button onClick={() => handleFriendToggle(friend)}>
              <Checkbox
                edge="start"
                checked={selectedFriends.some(f => f.userId === friend.userId)}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={friend.userNickname} />
            </ListItem>
          ))}
        </List>
        <TextField
          margin="normal"
          required
          fullWidth
          label="초대할 사용자 닉네임 (쉼표로 구분)"
          placeholder="예: user2, user3"
          value={userNicknames}
          onChange={(e) => setUserNicknames(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleCreateRoom}
        >
          만들기
        </Button>
      </Box>
    </Modal>
  );
}

export default CreateRoomModal;
