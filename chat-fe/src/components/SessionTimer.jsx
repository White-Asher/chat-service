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
    <Box>
      <Typography variant="body2">
        세션 만료까지: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Typography>
    </Box>
  );
}

export default SessionTimer;
