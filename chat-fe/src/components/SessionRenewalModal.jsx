import React from 'react';
import { useUser } from '../context/UserContext';
import { Modal, Box, Typography, Button } from '@mui/material';

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

function SessionRenewalModal() {
  const { isRenewalModalOpen, renewSession, closeRenewalModal } = useUser();

  return (
    <Modal open={isRenewalModalOpen} onClose={closeRenewalModal}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          세션 만료 경고
        </Typography>
        <Typography sx={{ mt: 2 }}>
          세션이 곧 만료됩니다. 연장하시겠습니까?
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
          <Button variant="contained" color="primary" onClick={renewSession}>
            예 (세션 연장)
          </Button>
          <Button variant="outlined" color="secondary" onClick={closeRenewalModal}>
            아니오
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default SessionRenewalModal;
