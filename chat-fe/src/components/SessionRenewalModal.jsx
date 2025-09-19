/**
 * @file SessionRenewalModal.jsx
 * @description 이 파일은 사용자 세션이 만료될 예정일 때 표시되는 SessionRenewalModal 컴포넌트를 포함한다.
 * 사용자에게 세션을 갱신할지 묻는다.
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
 * @component SessionRenewalModal
 * @description 세션 만료가 임박했을 때 세션 연장을 묻는 모달 컴포넌트
 */
function SessionRenewalModal() {
  // UserContext에서 세션 갱신 모달 상태, 세션 갱신 함수, 모달 닫기 함수를 가져옴
  const { isRenewalModalOpen, renewSession, closeRenewalModal } = useUser();

  // JSX 렌더링
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