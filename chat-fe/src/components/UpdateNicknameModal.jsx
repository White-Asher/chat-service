import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
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

function UpdateNicknameModal({ open, onClose, currentNickname, onSave }) {
  const [newNickname, setNewNickname] = useState('');
  const [error, setError] = useState('');

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setNewNickname('');
      setError('');
    }
  }, [open]);

  const handleSave = () => {
    if (!newNickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (newNickname.trim() === currentNickname) {
      setError('새 닉네임이 현재 닉네임과 동일합니다.');
      return;
    }
    onSave(newNickname.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="update-nickname-modal-title"
    >
      <Box sx={style}>
        <Typography id="update-nickname-modal-title" variant="h6" component="h2">
          닉네임 변경
        </Typography>
        <Box sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="새 닉네임"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          />
        </Box>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>취소</Button>
          <Button variant="contained" onClick={handleSave}>저장</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UpdateNicknameModal;
