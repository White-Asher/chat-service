import React from 'react';
import {
  Modal,
  Box,
  Typography,
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

function ConfirmModal({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-modal-title"
    >
      <Box sx={style}>
        <Typography id="confirm-modal-title" variant="h6" component="h2">
          {title || '확인'}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {message}
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>취소</Button>
          <Button variant="contained" onClick={() => { onConfirm(); onClose(); }}>확인</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ConfirmModal;
