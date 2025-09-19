import React, { useState, useEffect } from 'react';
import { createChatRoom, getFriendList } from '../api';
import InfoModal from './InfoModal';
import SelectFriendsModal from './SelectFriendsModal';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Chip
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
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' });
  const [isSelectFriendsModalOpen, setSelectFriendsModalOpen] = useState(false);

  const showInfoModal = (title, message) => {
    setInfoModalContent({ title, message });
    setInfoModalOpen(true);
  };

  useEffect(() => {
    if (open) {
      // 모달이 열릴 때 상태 초기화
      setRoomName('');
      setSelectedFriends([]);
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

  const handleSelectFriendsConfirm = (newSelectedFriends) => {
    setSelectedFriends(newSelectedFriends);
    setSelectFriendsModalOpen(false);
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      showInfoModal('입력 오류', '채팅방 이름을 입력해주세요.');
      return;
    }

    if (selectedFriends.length === 0) {
      showInfoModal('입력 오류', '초대할 친구를 1명 이상 선택해주세요.');
      return;
    }

    try {
      const invitedUserNicknames = selectedFriends.map(f => f.userNickname);
      const roomData = {
        roomName,
        userNicknames: [currentUser.userNickname, ...invitedUserNicknames],
        roomType: 'GROUP',
      };
      const response = await createChatRoom(roomData);
      showInfoModal('성공', '채팅방이 생성되었습니다.');
      onClose(); // CreateRoomModal 닫기
      if (onRoomCreated) {
        onRoomCreated(response.data.roomId);
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
      const errorMessage = error.response?.data?.error || '채팅방 생성에 실패했습니다.';
      showInfoModal('오류', errorMessage);
    }
  };

  return (
    <>
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
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>초대할 친구</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '40px', border: '1px solid #ccc', borderRadius: 1, p: 1, mb: 2 }}>
            {selectedFriends.map((friend) => (
              <Chip key={friend.userId} label={friend.userNickname} />
            ))}
          </Box>
          <Button fullWidth variant="outlined" onClick={() => setSelectFriendsModalOpen(true)}>
            친구 선택
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleCreateRoom}
          >
            만들기
          </Button>
          <InfoModal
            open={isInfoModalOpen}
            onClose={() => setInfoModalOpen(false)}
            title={infoModalContent.title}
            message={infoModalContent.message}
          />
        </Box>
      </Modal>
      <SelectFriendsModal
        open={isSelectFriendsModalOpen}
        onClose={() => setSelectFriendsModalOpen(false)}
        onConfirm={handleSelectFriendsConfirm}
        friendsList={friends}
        initialSelectedFriends={selectedFriends}
      />
    </>
  );
}

export default CreateRoomModal;
