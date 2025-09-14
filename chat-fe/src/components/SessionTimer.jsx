import React from 'react';
import { useUser } from '../context/UserContext.jsx';
import { Typography, Box } from '@mui/material';

function SessionTimer() {
  const { user, remainingTime } = useUser();

  if (!user) {
    return null;
  }

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <Box sx={{ position: 'fixed', top: 16, right: 16, backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', padding: '4px 12px', borderRadius: '12px' }}>
      <Typography variant="body2">
        세션 만료까지: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Typography>
    </Box>
  );
}

export default SessionTimer;
