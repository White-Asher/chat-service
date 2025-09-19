/**
 * @file SessionExpiredModal.jsx
 * @description 이 파일은 사용자 세션이 만료되었을 때 표시되는 SessionExpiredModal 컴포넌트를 포함한다.
 * 사용자에게 다시 로그인하도록 안내한다.
 * 
 * @requires react
 * @requires ../context/UserContext
 * @requires @mui/material
 */

import React from 'react';

// 사용자 컨텍스트
import { useUser } from '../context/UserContext';

// MUI 컴포넌트
import { Modal, Box, Typography, Button } from '@mui/material';

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
  textAlign: 'center',
};

/**
 * @component SessionExpiredModal
 * @description 세션이 만료되었을 때 표시되는 모달 컴포넌트
 */
function SessionExpiredModal() {
  // UserContext에서 세션 만료 상태와 모달 닫기 함수를 가져옴
  const { isSessionExpired, closeExpiredModalAndLogin } = useUser();

  // JSX 렌더링
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