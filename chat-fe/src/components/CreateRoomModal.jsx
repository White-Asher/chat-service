import React, { useState } from 'react';
import { createChatRoom } from '../api';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
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

function CreateRoomModal({ open, onClose, currentUser }) {
  const [roomName, setRoomName] = useState('');
  const [userNicknames, setUserNicknames] = useState('');

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('채팅방 이름을 입력해주세요.');
      return;
    }
    // 입력받은 userNicknames를 문자열 배열로 변환
    const invitedUserNicknames = userNicknames.split(',').map(nickname => nickname.trim()).filter(nickname => nickname);

    if (invitedUserNicknames.length === 0) {
      alert('초대할 사용자의 닉네임을 1명 이상 입력해주세요.');
      return;
    }

    try {
      const roomData = {
        roomName,
        // 현재 사용자와 초대된 사용자를 모두 참여자로 추가
        userNicknames: [currentUser.userNickname, ...invitedUserNicknames],
        roomType: 'GROUP', // 그룹 채팅방으로 생성
      };
      await createChatRoom(roomData);
      alert('채팅방이 생성되었습니다.');
      onClose(); // 모달 닫기
      window.location.reload(); // 페이지 새로고침하여 목록 갱신
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