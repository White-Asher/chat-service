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

function SessionExpiredModal() {
  const { isSessionExpired, closeExpiredModalAndLogin } = useUser();

  return (
    <Modal open={isSessionExpired} onClose={closeExpiredModalAndLogin}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          세션 만료
        </Typography>
        <Typography sx={{ mt: 2 }}>
          세션이 만료되었습니다. 다시 로그인해주세요.
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={closeExpiredModalAndLogin}>
          확인
        </Button>
      </Box>
    </Modal>
  );
}

export default SessionExpiredModal;
