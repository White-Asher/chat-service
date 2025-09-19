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
  textAlign: 'center',
};

function InfoModal({ open, onClose, title, message }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="info-modal-title"
    >
      <Box sx={style}>
        <Typography id="info-modal-title" variant="h6" component="h2">
          {title || '알림'}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {message}
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={onClose}>확인</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default InfoModal;
