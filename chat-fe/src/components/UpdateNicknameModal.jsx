/**
 * @file UpdateNicknameModal.jsx
 * @description 이 파일은 사용자 닉네임을 업데이트하기 위한 모달인 UpdateNicknameModal 컴포넌트를 포함한다.
 * 
 * @requires react
 * @requires @mui/material
 */

import React, { useState, useEffect } from 'react';

// MUI 컴포넌트
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

// 모달 스타일
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

/**
 * @component UpdateNicknameModal
 * @description 사용자 닉네임 변경을 위한 모달 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {boolean} props.open - 모달 열림/닫힘 상태
 * @param {function} props.onClose - 모달 닫기 핸들러
 * @param {string} props.currentNickname - 현재 닉네임
 * @param {function} props.onSave - 저장 버튼 클릭 시 호출될 함수
 */
function UpdateNicknameModal({ open, onClose, currentNickname, onSave }) {
  // 컴포넌트 상태 변수들
  const [newNickname, setNewNickname] = useState(''); // 새 닉네임
  const [error, setError] = useState(''); // 에러 메시지

  // 모달이 닫힐 때 상태(새 닉네임, 에러 메시지)를 초기화
  useEffect(() => {
    if (!open) {
      setNewNickname('');
      setError('');
    }
  }, [open]);

  /**
   * @function handleSave
   * @description 저장 버튼 클릭 시 닉네임 유효성 검사를 하고, onSave 콜백을 호출하는 함수
   */
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

  // JSX 렌더링
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
          {/* 에러 메시지 표시 */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {/* 새 닉네임 입력 필드 */}
          <TextField
            fullWidth
            label="새 닉네임"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()} // Enter 키로 저장
          />
        </Box>
        {/* 하단 버튼 (취소, 저장) */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>취소</Button>
          <Button variant="contained" onClick={handleSave}>저장</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UpdateNicknameModal;