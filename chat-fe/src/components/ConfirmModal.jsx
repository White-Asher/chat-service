/**
 * @file ConfirmModal.jsx
 * @description 이 파일은 작업 확인을 위한 재사용 가능한 모달인 ConfirmModal 컴포넌트를 포함한다.
 * 제목, 메시지, 그리고 "취소" 및 "확인" 두 개의 버튼을 표시한다.
 * 
 * @requires react
 * @requires @mui/material
 */

import React from 'react';

// MUI 컴포넌트
import {
  Modal,
  Box,
  Typography,
  Button,
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
 * @component ConfirmModal
 * @description 사용자에게 특정 작업을 확인받기 위한 공용 모달 컴포넌트
 * @param {object} props - 컴포넌트 props
 * @param {boolean} props.open - 모달 열림/닫힘 상태
 * @param {function} props.onClose - 모달 닫기 핸들러
 * @param {function} props.onConfirm - 확인 버튼 클릭 시 실행될 함수
 * @param {string} props.title - 모달 제목
 * @param {string} props.message - 모달에 표시될 메시지
 */
function ConfirmModal({ open, onClose, onConfirm, title, message }) {
  // JSX 렌더링
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-modal-title"
    >
      <Box sx={style}>
        {/* 모달 제목 */}
        <Typography id="confirm-modal-title" variant="h6" component="h2">
          {title || '확인'}
        </Typography>
        {/* 모달 메시지 */}
        <Typography sx={{ mt: 2 }}>
          {message}
        </Typography>
        {/* 하단 버튼 (취소, 확인) */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>취소</Button>
          <Button variant="contained" onClick={() => { onConfirm(); onClose(); }}>확인</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ConfirmModal;