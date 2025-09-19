/**
 * @file SessionTimer.jsx
 * @description 이 파일은 사용자 세션이 만료될 때까지 남은 시간을 표시하는 SessionTimer 컴포넌트를 포함한다.
 * 
 * @requires react
 * @requires ../context/UserContext.jsx
 * @requires @mui/material
 */

import React from 'react';

// 사용자 컨텍스트
import { useUser } from '../context/UserContext.jsx';

// MUI 컴포넌트
import { Typography, Box } from '@mui/material';

/**
 * @component SessionTimer
 * @description 사용자 세션의 남은 시간을 표시하는 컴포넌트
 */
function SessionTimer() {
  // UserContext에서 사용자 정보와 남은 시간을 가져옴
  const { user, remainingTime } = useUser();

  // 사용자가 로그인되어 있지 않으면 타이머를 표시하지 않음
  if (!user) {
    return null;
  }

  // 남은 시간을 분과 초로 변환
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  // JSX 렌더링
  return (
    <Box>
      <Typography variant="body2">
        세션 만료까지: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Typography>
    </Box>
  );
}

export default SessionTimer;